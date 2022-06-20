import admin from 'firebase-admin';

const firebaseAdminConfig = {
	type: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_TYPE,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID,
	privateKeyId: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY_ID,
	privateKey: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY?.replace(
		/\\n/g,
		'\n'
	),
	clientEmail: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL,
	clientId: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_ID,
	authUri: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_AUTH_URI,
	tokenUri: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_TOKEN_URI,
	authProviderX509CertUrl:
		process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PROVIDER_URL,
	clientX509CertUrl: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_URL,
};

export const appAdmin = () => {
	if (!admin.apps.length) {
		admin.initializeApp({
			credential: admin.credential.cert(firebaseAdminConfig),
			databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
		});
	}

	return admin;
};
