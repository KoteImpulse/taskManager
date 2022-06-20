import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import db, { auth } from '../firebase';
import { useRouter } from 'next/router';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { defaultProjects, eraseCookie, newUser, setCookie } from '../helpers/helpers';
import { useAppDispatch } from '../hooks/reduxTK';
import { userSlice } from '../store/slices/UserSlice';

interface AuthPageProps {}

const Auth: NextPage<AuthPageProps> = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const router = useRouter();
	const dispatch = useAppDispatch();

	const onAuthStateChange = () => {
		return onAuthStateChanged(auth, async (user) => {
			if (user) {
				const token = await user.getIdToken();
				setCookie('firebaseToken', token, 90);
				setCookie('userId', user.uid, 90);
			} else {
				eraseCookie('firebaseToken');
				eraseCookie('userId');
			}
		});
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChange();
		return () => {
			unsubscribe();
		};
	}, []);

	const handleLogin = async (e: FormEvent) => {
		try {
			let userId = '';
			e.preventDefault();
			await signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
				const user = userCredential.user;
				userId = user.uid;
			});
			const userRef = doc(db, 'users', userId);
			const userSnap = await getDoc(userRef);
			const startPage = userSnap?.data()?.startPage;
			const q = query(
				collection(db, 'projects'),
				where('userId', '==', userId),
				where('order', '==', startPage === 'inbox' ? -1 : startPage === 'today' ? -2 : -3)
			);
			const querySnapshot = await getDocs(q);
			router.push(`/project/${querySnapshot.docs[0].id}`);
		} catch (e) {
			console.log(e);
		}
	};
	const handleSignUp = async (e: FormEvent) => {
		e.preventDefault();
		let userId = '';
		try {
			await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
				const user = userCredential.user;
				userId = user.uid;
				setDoc(doc(db, 'users', user.uid), newUser());
				const proj = defaultProjects(
					user.uid,
					`Входящие`,
					`Входящие`,
					`Сегодня`,
					`Сегодня`,
					`Предстоящие`,
					`Предстоящие`
				);
				addDoc(collection(db, 'projects'), proj.inbox);
				addDoc(collection(db, 'projects'), proj.today);
				addDoc(collection(db, 'projects'), proj.nextWeek);
			});
			const q = query(collection(db, 'projects'), where('userId', '==', userId), where('order', '==', -2));
			const querySnapshot = await getDocs(q);
			router.push(`/project/${querySnapshot.docs[0].id}`);
		} catch (e) {
			console.log(e);
		}
	};
	const handleLogout = async () => {
		try {
			await signOut(auth).then(() => {
				dispatch(userSlice.actions.setEmptyUser());
			});
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<>
			<Head>
				<title>{'Страница логина/регистрации'}</title>
				<meta name='description' content={`Страница логина/регистрации`} />
			</Head>
			<form onSubmit={(e) => handleLogin(e)}>
				<p>{`Логин`}</p>
				<input type='email' onChange={(e) => setEmail(e.target.value)} />
				<input type='password' onChange={(e) => setPassword(e.target.value)} autoComplete='off' />
				<button type='submit'>{`логин`}</button>
			</form>
			<form onSubmit={(e) => handleSignUp(e)}>
				<p>{`Регистрация`}</p>
				<input type='email' onChange={(e) => setEmail(e.target.value)} />
				<input type='password' onChange={(e) => setPassword(e.target.value)} autoComplete='off' />
				<button type='submit'>{`регистрация`}</button>
			</form>
			<h1>{`Страница логина/регистрации`}</h1>
			<Link href={'/'} passHref>
				<button>{`home`}</button>
			</Link>
			{<button onClick={handleLogout}>{`logout`}</button>}
		</>
	);
};

export default Auth;
