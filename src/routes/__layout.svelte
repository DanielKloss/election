<script context="module">
	export async function load({fetch}){
		const partyResponse = await fetch("https://api.jsonbin.io/v3/b/62d96e8b2c868775a531d0bf", {
			headers: {
				"X-Master-Key": "$2b$10$aWj29BEZRf.vYyRISeB.3OPo6sF0UeRsMdMbXU.ZkwOypWfR8CVdO",
				"X-Bin-Meta": "false"
			}
		});
		const partyResult = await partyResponse.json();

		return {
			stuff: {
				partyOne: partyResult[0],
				partyTwo: partyResult[1]
			}
		};
	}
</script>

<script>
	import '../reset.css';
</script>

<slot />
