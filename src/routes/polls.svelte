<script context="module">
	import faunadb from 'faunadb';
	import query from 'faunadb';

	const client = new faunadb.Client({
        secret: "fnAEslFof5AAQopJqy0DcJ_mEllAyKEfOtw60ATK",
        domain: 'db.us.fauna.com',
        scheme: 'https'
    })

	export async function load({stuff}){
        let newsTicker = await client.query(query.Map(
            query.Paginate(query.Documents(query.Collection('newsTicker'))),
            query.Lambda(x => query.Get(x))
        ))

		return {
			props: {
				partyOne: stuff.partyOne,
				partyTwo: stuff.partyTwo,
				taskList: newsTicker.data[0].data.news
			}
		};
	}
</script>

<script>
	import { Loader } from '@svelteuidev/core';
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import HiSolidRefresh from "svelte-icons-pack/hi/HiSolidRefresh";
	import { onMount } from 'svelte';
    import { selectedParty } from '../stores';

	export let partyOne;
	export let partyTwo;
	export let taskList;

	let loading = true;

	$: relativeTeamOne = Math.round((partyOne.points / (partyOne.points + partyTwo.points)) * 100);
	$: relativeTeamTwo = Math.round((partyTwo.points / (partyOne.points + partyTwo.points)) * 100);

	// THIS LIVE UI UPDATE DIDNT WORK. IT SUBSCRIBED AND RETRIEVED DATA FROM THE DATABASE BUT ONLY RECIEVED IT ON THE SERVER - I COULDNT WORK OUT HOW TO PASS IT TO THE UI
	
	// const client = new faunadb.Client({
	// 	secret: "fnAEslFof5AAQopJqy0DcJ_mEllAyKEfOtw60ATK",
	// 	domain: 'db.us.fauna.com',
	// 	scheme: 'https'
	// })

	// let stream = client.stream.document(q.Ref(q.Collection("newsTicker"), "338462957094568002"))
	// 	.on('snapshot', async (snapshot) => { taskList =snapshot.data.news, console.log("HERE") })
	// 	.on('version', (version) => { taskList = version.document.data.news, console.log("THERE") });

	// stream.start();

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

	async function updateNewsFeed(){
		loading = true;
		let newsTicker = await client.query(q.Map(
			q.Paginate(q.Documents(q.Collection('newsTicker'))),
			q.Lambda(x => q.Get(x))
		))

		taskList = newsTicker.data[0].data.news;
		loading = false;
		console.log("HERE")
	}
</script>

<div class="page" style="--piss:{partyOne.colour}; --crap:{partyTwo.colour}; --partyColour:{$selectedParty?.colour}">
	{#if $selectedParty}
		<div style="display:flex;">
			<div class="card titleBar partyBackground" style="flex: 1;">
				{$selectedParty.abbreviation} Polls Dashboard
			</div>
			{#if loading}
				<div class="loader">
					<Loader variant='dots' size='lg' color='gray'/>
				</div>
			{:else}
				<button class="iconButton" on:click={() => updateNewsFeed()}><Icon src={HiSolidRefresh} size="24"/></button>
			{/if}
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
		<h1>Latest News</h1>
		<div class="scroll">
			{#each taskList as task}
				<div class="newsCard">
					<div class="newsHeader partyBackground" style="--partyColour:{task.party}">
						<p>BREAKING NEWS</p>
					</div>
					<div class="newsItem">
						<p>{task.news}</p>
					</div>
				</div>
			{/each}
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
	.scroll {
		overflow-y:auto;
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		gap: 1rem;
	}

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
		height: calc(100vh - 2rem);
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

	.iconButton {
		border: none;
		background: transparent;
		align-self: center;
		margin: 0 1rem 0 1rem;
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

	.newsCard {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		box-shadow: rgba(0, 0, 0, 0.2) 0 3px 5px -1px, rgba(0, 0, 0, 0.14) 0 6px 10px 0,
			rgba(0, 0, 0, 0.12) 0 1px 18px 0;
		border-radius: 15px;
	}

	.newsHeader {
		font-weight: bold;
		border-radius: 15px 15px 0 0;
		padding: 0.75rem 0.5rem 0.75rem 1rem;
	}

	.newsItem {
		border-radius: 15px 15px 0 0;
    	padding: 0rem 0.5rem 0.75rem 1rem;
	}

	.loader {
		display: flex;
		justify-content: center;
		align-self: center;
		margin: 0 1rem 0 1rem;
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
