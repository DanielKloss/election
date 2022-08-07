<script context="module">
	import faunadb from 'faunadb';
	import query from 'faunadb';

	const client = new faunadb.Client({
			secret: import.meta.env.VITE_FAUNA_SECRET,
			domain: 'db.us.fauna.com',
			scheme: 'https'
		})

	export async function load({stuff}){
		let tasks = await client.query(query.Map(
            query.Paginate(query.Documents(query.Collection('tasks'))),
            query.Lambda(x => query.Get(x))
        ))

		return {
			props: {
				tasks: tasks.data,
				parties: [stuff.partyOne, stuff.partyTwo]
			}
		};
	}
</script>

<script>
	import { Loader } from '@svelteuidev/core';
	import { onMount } from 'svelte';
	import PartySelector from '../lib/partySelector.svelte';
    import { selectedParty, currentTask } from '../stores';

	export let parties;
	export let tasks;
	
	let tasksCompleted = 0;
	let answer;

	let loading = true;
	let taskComplete = "";
	$: finished = tasksCompleted == tasks.length;

	onMount(() => {
		if (sessionStorage.getItem('party')) {
			selectedParty.set(JSON.parse(sessionStorage.getItem('party') || '{}'));
		}

		if (sessionStorage.getItem('currentTask')) {
			currentTask.set(JSON.parse(sessionStorage.getItem('currentTask') || 0));
		}

		loading = false;
	});

	async function processCorrectAnswer(){
		console.log("correct")
		let party = await client.query(query.Get(query.Match(query.Index("partyByAbbreviation"), $selectedParty.abbreviation)));
		let points = party.data.points + 1;
		await client.query(query.Update(query.Select("ref", query.Get(query.Match(query.Index("partyByAbbreviation"), party.data.abbreviation))), {
			data: { points: points }
		}));
		let news = await client.query(query.Get(query.Ref(query.Collection("newsTicker"), "338462957094568002")));
		let newsList = news.data.news;
		await client.query(query.Update(query.Ref(query.Collection("newsTicker"), "338462957094568002"),
			{data:{news:[{party: $selectedParty.colour, news: $selectedParty.abbreviation + " candidate " + tasks[$currentTask].data.tickerSuccess}, ...newsList]}}
		));
		taskComplete = "Good stuff! " + tasks[$currentTask].data.completeMessage + " Well done, you've boosted your position in the polls.";
	}

	async function processIncorrectAnswer(){
		console.log("incorrect")
		let news = await client.query(query.Get(query.Ref(query.Collection("newsTicker"), "338462957094568002")));
		let newsList = news.data.news;
		await client.query(query.Update(query.Ref(query.Collection("newsTicker"), "338462957094568002"),
			{data: {news:[{party: $selectedParty.colour, news: $selectedParty.abbreviation + " candidate " + tasks[$currentTask].data.tickerFail}, ...newsList]}}
		));
		taskComplete = "Uh oh! " + tasks[$currentTask].data.incompleteMessage + " Your blunder has damaged your position in the polls.";
	}

	async function submitAnswer() {
		if (answer == ""){
			return;
		}
		
		loading = true;

		if (tasks[$currentTask].data.questionType == "numerical"){
			console.log("numerical")
			let opertion = tasks[$currentTask].data.answers[0];
			let threshold = tasks[$currentTask].data.answers[1];

			if (opertion == "more"){
				console.log("more")
				if (answer > threshold){
					await processCorrectAnswer();
				} else {
					await processIncorrectAnswer();
				}
			} else if (opertion == "less"){
				console.log("less")
				if (answer < threshold){
					await processCorrectAnswer();
				} else {
					await processIncorrectAnswer();
				}
			}
		} else {
			if (tasks[$currentTask].data.answers.some((a) => a == answer.toLowerCase())) {
				await processCorrectAnswer();
			} else {
				await processIncorrectAnswer();
			}
		}

		answer = "";
		if ($currentTask == tasks.length-1) {
          $currentTask = 0;
        } else {
			$currentTask++;
		}

		tasksCompleted++;

		sessionStorage.setItem('currentTask', $currentTask);
		
		loading = false;
	}
</script>

<div class="page" style="--piss:{parties[0].colour}; --crap:{parties[1].colour}; --partyColour:{$selectedParty?.colour}">
	{#if $selectedParty}
		<div class="card titleBar partyBackground">
			{$selectedParty.abbreviation} Task Dashboard
		</div>
		{#if loading}
			<div class="loader">
				<Loader variant='dots' size='lg' color='gray'/>
			</div>
		{:else if taskComplete != ""}
			<div class="card">
				<p>{taskComplete}</p>
				<button class="button partyBackground submitButton" on:click={() => taskComplete = ""}>Next Task</button>
			</div>
		{:else if !finished}
			<div class="card">
				<h2>{tasks[$currentTask].data.title}</h2>
				<p>{tasks[$currentTask].data.text}</p>
			</div>
			{#if tasks[$currentTask].data.hidden != ""}
				<button class="button partyBackground revealButton" on:click={() => tasks[$currentTask].data.hidden = ""}>{tasks[$currentTask].data.hidden}</button>
			{:else}
				{#if tasks[$currentTask].data.questionType == "numerical"}
					<div class="card">
						<p class="instructionText">{tasks[$currentTask].data.instruction}</p>
						<input type="number" class="inputBox" bind:value={answer} />
						<button class="button partyBackground submitButton" on:click={() => submitAnswer()}>Submit</button>
					</div>
				{:else if tasks[$currentTask].data.questionType == "options"}
					<div class="card">
						<p class="instructionText">{tasks[$currentTask].data.instruction}</p>
						<div class="options">
							{#each tasks[$currentTask].data.options as option}
								<button class="button partyBackground optionButton" on:click={() => {answer = option; submitAnswer()}}>{option}</button>
							{/each}
						</div>
					</div>
				{:else if tasks[$currentTask].data.questionType == "text"}
					<div class="card">
						<p class="instructionText">{tasks[$currentTask].data.instruction}</p>
						<input type="text" class="inputBox" bind:value={answer} />
						<button class="button partyBackground submitButton" on:click={() => submitAnswer()}>Submit</button>
					</div>
				{/if}
			{/if}
		{:else}
			<p>Tasks completed! All you can do now is wait for election night and hope you've done enough to trick... erm we mean, convince... the voters to vote for you! Meet in the Dining Room for the results.</p>
		{/if}
	{:else}
		<PartySelector {parties}/>
	{/if}
</div>

<style>
	.titleBar {
		font-weight: bold;
	}

	.page {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		font-family: 'Arial';
		color: #18182f;
		gap: 1rem;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		box-shadow: rgba(0, 0, 0, 0.2) 0 3px 5px -1px, rgba(0, 0, 0, 0.14) 0 6px 10px 0,
			rgba(0, 0, 0, 0.12) 0 1px 18px 0;
		border-radius: 15px;
	}

	.options {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
	}

	.optionButton {
		text-transform: capitalize;
	}

	.button {
		font-size: 1.5rem;
		width: 40%;
		background-color: #fff;
		border-radius: 15px;
		border-style: none;
		box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
		padding: 0.5rem;
	}

	.submitButton {
		align-self: center;
	}

	.revealButton {
		align-self: center;
		width: 100%;
	}

	.loader {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.inputBox {
		font-size: 1.5rem;
		border-radius: 15px;
		border-style: none;
		box-shadow: rgba(0, 0, 0, 0.2) 0 3px 5px -1px, rgba(0, 0, 0, 0.14) 0 6px 10px 0,
			rgba(0, 0, 0, 0.12) 0 1px 18px 0;
		padding: 1rem;
	}

	.instructionText {
		font-weight: bold;
	}

	.partyBackground {
		background-color: var(--partyColour);
	}
</style>
