<script context="module">
	export async function load({ stuff }){
		return {
			props: {
				partyOne: stuff.partyOne,
				partyTwo: stuff.partyTwo
			}
		};
	}
</script>

<script>
	import { onMount } from 'svelte';
    import { selectedParty } from '../stores';

	export let partyOne;
	export let partyTwo;

	let loading = true;

	$: relativeTeamOne = Math.round((partyOne.points / (partyOne.points + partyTwo.points)) * 100);
	$: relativeTeamTwo = Math.round((partyTwo.points / (partyOne.points + partyTwo.points)) * 100);

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

	//Scrolling history of both team's achievements?
</script>

<div class="page" style="--piss:{partyOne.colour}; --crap:{partyTwo.colour}; --partyColour:{$selectedParty?.colour}">
	{#if $selectedParty}
		<div class="card titleBar partyBackground">
			{$selectedParty.abbreviation} Polls Dashboard
		</div>
		<div class="card">
			<div class="chart">
				<div class="pissBackground teamOneChart bar" style="--width:{relativeTeamOne}%">
					<p>{relativeTeamOne}</p>
				</div>
				<div class="crapBackground teamTwoChart bar" style="--width:{relativeTeamTwo}%">
					<p>{relativeTeamTwo}</p>
				</div>
			</div>
			<div class="names">
				<div class="name">
					<p class="abbreviation">{partyOne.abbreviation}</p>
					<p class="fullName">{partyOne.name}</p>
				</div>
				<div class="name" style="text-align: right;">
					<p class="abbreviation">{partyTwo.abbreviation}</p>
					<p class="fullName">{partyTwo.name}</p>
				</div>
			</div>
		</div>
	{:else if !loading}
		<div class="card">
			<h1 class="title">Login</h1>
			<p>Select your party</p>
			<div class="loginButtons">
				<button class="button pissBackground" on:click={() => selectParty(partyOne)}>
					{partyOne.abbreviation}
				</button>
				<button class="button crapBackground" on:click={() => selectParty(partyTwo)}>
					{partyTwo.abbreviation}
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

	.chart {
		width: 100%;
		display: flex;
	}

	.bar {
		width: var(--width);
		transition: width 2s ease;
		display: flex;
		padding: 0.5rem 1rem;
		font-size: 2rem;
	}

	.teamOneChart {
		border-radius: 15px 0 0 15px;
	}

	.teamTwoChart {
		justify-content: end;
		border-radius: 0 15px 15px 0;
	}

	.names {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
	}

	.name {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.fullName {
		font-size: 0.75rem;
	}

	.abbreviation {
		font-size: 1.5rem;
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
