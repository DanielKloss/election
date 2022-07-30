<script context="module">
	import faunadb, { query as q } from 'faunadb';

	const client = new faunadb.Client({
        secret: "fnAEslFof5AAQopJqy0DcJ_mEllAyKEfOtw60ATK",
        domain: 'db.us.fauna.com',
        scheme: 'https'
    })

	export async function load(){
        let parties = await client.query(q.Map(
            q.Paginate(q.Documents(q.Collection('parties'))),
            q.Lambda(x => q.Get(x))
        ))

		return {
			stuff: {
				partyOne: parties.data[0].data,
				partyTwo: parties.data[1].data
			}
		};
	}
</script>

<script>
	import '../reset.css';

	//Change order of tasks for both teams
</script>

<slot />
