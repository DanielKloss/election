<script context="module">
	export async function load({fetch, stuff}){
		const tasksResponse = await fetch("https://api.jsonbin.io/v3/b/62dd0ca88ebcdb75883e6399", {
			headers: {
				"X-Master-Key": "$2b$10$aWj29BEZRf.vYyRISeB.3OPo6sF0UeRsMdMbXU.ZkwOypWfR8CVdO",
				"X-Bin-Meta": "false"
			}
		});
		const tasksResult = await tasksResponse.json();

		return {
			props: {
				tasks: tasksResult,
				parties: [stuff.partyOne, stuff.partyTwo]
			}
		};
	}
</script>

<script>
	import { onMount } from 'svelte';
    import { selectedParty } from '../stores';

	export let parties;
	export let tasks;

	let tasksCompleted = 0;
	let answer;

	let loading = true;

	$: finished = tasksCompleted == tasks.length;

	onMount(() => {
		if (sessionStorage.getItem('party')) {
			selectedParty.set(JSON.parse(sessionStorage.getItem('party') || '{}'));
		}

		loading = false;
	});

	function selectParty(party) {
		selectedParty.set(party);
		sessionStorage.setItem('party', JSON.stringify(party));
	}

	async function submitAnswer() {
		if (tasks[tasksCompleted].answers.some((a) => a == answer.toLowerCase())) {
			//add points to party
			parties.find(p => p.name == $selectedParty.name).points++;
			console.log(parties)

			//Add Points to database
			const tasksResponse = await fetch("https://api.jsonbin.io/v3/b/62d96e8b2c868775a531d0bf", {
				method: "PUT",
				headers: {
					"X-Master-Key": "$2b$10$aWj29BEZRf.vYyRISeB.3OPo6sF0UeRsMdMbXU.ZkwOypWfR8CVdO",
					"Content-Type": "application/json"
				},
				body: await JSON.stringify(parties)
			});

			//Correct Message
		} else {
			//Incorrect Message
		}
		answer = "";
		tasksCompleted++;
	}
</script>

<div class="page" style="--piss:{parties[0].colour}; --crap:{parties[1].colour}; --partyColour:{$selectedParty?.colour}">
	{#if $selectedParty}
		<div class="card titleBar partyBackground">
			{$selectedParty.abbreviation} Task Dashboard
		</div>
		{#if !finished}
			<div class="card">
				<h2>{tasks[tasksCompleted].title}</h2>
				<p>{tasks[tasksCompleted].text}</p>
			</div>
			{#if tasks[tasksCompleted].hidden != ""}
				<button class="button partyBackground revealButton" on:click={() => tasks[tasksCompleted].hidden = ""}>{tasks[tasksCompleted].hidden}</button>
			{:else}
				<div class="card">
					<p class="instructionText">{tasks[tasksCompleted].instruction}</p>
					<input type="text" class="inputBox" bind:value={answer} />
					<button class="button partyBackground submitButton" on:click={() => submitAnswer()}>Submit</button>
				</div>
			{/if}
		{/if}
	{:else if !loading}
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
