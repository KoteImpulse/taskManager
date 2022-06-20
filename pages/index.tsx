import Head from 'next/head';
import { useAppDispatch } from '../hooks/reduxTK';
import { getLayout } from '../layouts/MainLayout/MainLayout';
import { wrapper } from '../store';

const Home = () => {
	const dispatch = useAppDispatch();
	return (
		<>
			<Head>
				<title>{`Главная страница`}</title>
				<meta name='description' content={`Главная страница`} />
			</Head>
			<div>Главная страница</div>
		</>
	);
};

export const getServerSideProps = wrapper.getServerSideProps(
	(store) => async (context: any) => {
		// await store.dispatch()
		return {
			props: { co: context?.resolvedUrl },
			redirect: {
				destination: '/auth'
			}
		};
	}
);

Home.getLayout = getLayout;

export default Home;
