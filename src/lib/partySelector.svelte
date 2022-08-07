<script>
    import { selectedParty, currentTask } from '../stores';

    export let parties;

    function selectParty(party) {
		selectedParty.set(party);
		sessionStorage.setItem('party', JSON.stringify(party));
		
console.log($selectedParty)

		if ($selectedParty.abbreviation == "PISS"){
			currentTask.set(7);
		} else {
			currentTask.set(3);
		}

		sessionStorage.setItem('currentTask', $currentTask);
	}
</script>

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

<style>
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

    .pissBackground {
		background-color: var(--piss);
	}

	.crapBackground {
		background-color: var(--crap);
	}
</style>