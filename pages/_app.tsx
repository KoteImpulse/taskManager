import '../styles/globals.scss';
import '../styles/toasts.scss';
import type { AppProps } from 'next/app';
import App from 'next/app';
import Head from 'next/head';
import { NextPage } from 'next';
import { ReactElement, ReactNode, useEffect } from 'react';
import { wrapper } from '../store';
import { fetchUser } from '../store/slices/UserSlice';
import { fetchProjects } from '../store/slices/ProjectsSlice';
import { fetchValidate } from '../helpers/helpers';
import { fetchTasks } from '../store/slices/TasksSlice';
import { fetchSections } from '../store/slices/SectionsSlice';

type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

const WrappedApp = ({ Component, pageProps }: AppPropsWithLayout) => {
	console.log('app render');
	useEffect(() => {
		console.log('app render at start APP');
	}, []);
	const getLayout = Component.getLayout ?? ((page) => page);
	return getLayout(
		<>
			<Head>
				<link rel='icon' href='/favicon.ico' />
				<meta name='robots' content='index' />
				<meta name='viewport' content='width=device-width' />
				<meta name='keywords' content={'site, todo, task, project, app'} />
			</Head>
			<Component {...pageProps} />
		</>
	);
};

WrappedApp.getInitialProps = wrapper.getInitialAppProps((store) => async (context) => {
	const {
		ctx: { req, asPath, res },
	} = context;
	try {
		const firebaseToken = req?.headers?.cookie;
		if (!firebaseToken && asPath !== '/auth') {
			res?.writeHead(302, {
				Location: '/auth',
			});
			res?.end();
		}
		if (asPath !== '/auth') {
			//@ts-ignore
			const result = await fetchValidate(req?.cookies.firebaseToken);
			await store.dispatch(fetchUser(result.uid));
			await store.dispatch(fetchProjects(result.uid));
			await store.dispatch(fetchTasks(result.uid));
			await store.dispatch(fetchSections(result.uid));
		}
		return {
			pageProps: {
				...(await App.getInitialProps(context)).pageProps,
			},
		};
	} catch (e) {
		console.log(e);
		if (asPath !== '/auth') {
			res?.writeHead(302, {
				Location: '/auth',
			});
			res?.end();
		}
		return {
			pageProps: {
				...(await App.getInitialProps(context)).pageProps,
			},
		};
	}
});

export default wrapper.withRedux(WrappedApp);
