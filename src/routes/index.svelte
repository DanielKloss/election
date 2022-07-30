<script context="module">
	import faunadb, { query as q } from 'faunadb';

	const client = new faunadb.Client({
			secret: "fnAEslFof5AAQopJqy0DcJ_mEllAyKEfOtw60ATK",
			domain: 'db.us.fauna.com',
			scheme: 'https'
		})

	export async function load({stuff}){
		let tasks = await client.query(q.Map(
            q.Paginate(q.Documents(q.Collection('tasks'))),
            q.Lambda(x => q.Get(x))
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
    import { selectedParty } from '../stores';

	export let parties;
	export let tasks;
	
	let currentTask;
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
			currentTask = sessionStorage.getItem('currentTask') || 0;
		}

		loading = false;
	});

	function selectParty(party) {
		selectedParty.set(party);
		sessionStorage.setItem('party', JSON.stringify(party));
		
		if ($selectedParty.id == 1){
			currentTask = 7;
		} else {
			currentTask = 3;
		}

		sessionStorage.setItem('currentTask', currentTask);
	}

	async function processCorrectAnswer(){
		let party = await client.query(q.Get(q.Match(q.Index("partyByAbbreviation"), "PISS")));
		let points = party.data.points + 1;
		await client.query(q.Update(q.Select("ref", q.Get(q.Match(q.Index("partyByAbbreviation"), "PISS"))), {
			data: { points: points }
		}));

		// await client.query(q.Create('newsTicker', {data: {party: $selectedParty.abbreviation, news: $selectedParty.abbreviation + " candidate " + tasks[currentTask].data.tickerSuccess}}));
		await client.query(q.Update(q.Ref(q.Collection("newsTicker"), "338462957094568002"),
			{party: $selectedParty.colour, news: $selectedParty.abbreviation + " candidate " + tasks[currentTask].data.tickerSuccess}
		));
		taskComplete = "Good stuff! " + tasks[currentTask].data.completeMessage + " Well done, you've boosted your position in the polls.";
	}

	async function processIncorrectAnswer(){
		// await client.query(q.Create('newsTicker', {data: {party: $selectedParty.abbreviation, news: $selectedParty.abbreviation + " candidate " + tasks[currentTask].data.tickerFail}}));
		let news = await client.query(q.Get(q.Ref(q.Collection("newsTicker"), "338462957094568002")));
		let newsList = news.data.news;
		console.log(newsList)
		await client.query(q.Update(q.Ref(q.Collection("newsTicker"), "338462957094568002"),
			{data: {news:[{party: $selectedParty.colour, news: $selectedParty.abbreviation + " candidate " + tasks[currentTask].data.tickerFail}, ...newsList]}}
		));
		taskComplete = "Uh oh! " + tasks[currentTask].data.incompleteMessage + "Your blunder has damaged your position in the polls.";
	}

	async function submitAnswer() {
		if (answer == ""){
			return;
		}
		
		loading = true;

		if (tasks[currentTask].data.questionType == "numerical"){
			let opertion = tasks[currentTask].data.answers[0];
			let threshold = tasks[currentTask].data.answers[1];

			if (opertion == "more"){
				if (answer > threshold){
					await processCorrectAnswer();
				} else {
					processIncorrectAnswer();
				}
			} else if (opertion == "less"){
				if (answer < threshold){
					await processCorrectAnswer();
				} else {
					await processIncorrectAnswer();
				}
			}
		} else {
			if (tasks[currentTask].data.answers.some((a) => a == answer.toLowerCase())) {
				await processCorrectAnswer();
			} else {
				await processIncorrectAnswer();
			}
		}

		answer = "";
		if (currentTask == tasks.length-1) {
          currentTask = 0;
        } else {
			currentTask++;
		}

		tasksCompleted++;

		sessionStorage.setItem('currentTask', currentTask);
		
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
				<h2>{tasks[currentTask].data.title}</h2>
				<p>{tasks[currentTask].data.text}</p>
			</div>
			{#if tasks[currentTask].data.hidden != ""}
				<button class="button partyBackground revealButton" on:click={() => tasks[currentTask].data.hidden = ""}>{tasks[currentTask].data.hidden}</button>
			{:else}
				{#if tasks[currentTask].data.questionType == "numerical"}
					<div class="card">
						<p class="instructionText">{tasks[currentTask].data.instruction}</p>
						<input type="number" class="inputBox" bind:value={answer} />
						<button class="button partyBackground submitButton" on:click={() => submitAnswer()}>Submit</button>
					</div>
				{:else if tasks[currentTask].data.questionType == "options"}
					<div class="card">
						<p class="instructionText">{tasks[currentTask].data.instruction}</p>
						<div class="options">
							{#each tasks[currentTask].data.options as option}
								<button class="button partyBackground optionButton" on:click={() => {answer = option; submitAnswer()}}>{option}</button>
							{/each}
						</div>
					</div>
				{:else if tasks[currentTask].data.questionType == "text"}
					<div class="card">
						<p class="instructionText">{tasks[currentTask].data.instruction}</p>
						<input type="text" class="inputBox" bind:value={answer} />
						<button class="button partyBackground submitButton" on:click={() => submitAnswer()}>Submit</button>
					</div>
				{/if}
			{/if}
		{:else}
			<p>Tasks completed! All you can do now is wait for election night and hope you've done enough to trick... erm we mean, convince... the voters to vote for you! Meet in the Dining Room for the results.</p>
		{/if}
	{:else}
		<div class="card">
			<h1 class="title">Login</h1>
			<p>Select your party</p>
			<div class="loginButtons">
				<button class="button pissBackground" on:click={() => selectParty(parties[0])}>
					{parties[0].abbreviation}
				</button>
				<button class="button crapBackground" on:click={() => selectParty(parties[1])}>
					{parties[1].abbreviation}
				</button>
			</div>
		</div>
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

	.loginButtons {
		display: flex;
		justify-content: space-evenly;
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

	.pissForeground {
		color: var(--piss);
	}

	.crapForeground {
		color: var(--crap);
	}

	.pissBackground {
		background-color: var(--piss);
	}

	.crapBackground {
		background-color: var(--crap);
	}

	.partyBackground {
		background-color: var(--partyColour);
	}
</style>
