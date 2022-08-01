<script context="module">
	import faunadb from 'faunadb';
	import query from 'faunadb';

	const client = new faunadb.Client({
        secret: "fnAEslFof5AAQopJqy0DcJ_mEllAyKEfOtw60ATK",
        domain: 'db.us.fauna.com',
        scheme: 'https'
    })

	export async function load(){
        let parties = await client.query(query.Map(
            query.Paginate(query.Documents(query.Collection('parties'))),
            query.Lambda(x => query.Get(x))
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
</script>

<slot />
