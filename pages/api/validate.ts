import { appAdmin } from '../../firebaseAdmin';

const validate = async (token: string) => {
	const decodedToken = await appAdmin().auth().verifyIdToken(token, true);
	const user = await appAdmin().auth().getUser(decodedToken.uid);
	return user;
};

const a = async (req: any, res: any) => {
	try {
		const { token } = JSON.parse(req.headers.authorization || '{}');
		if (!token) {
			return res.status(403).json({
				errorCode: 403,
				message: 'Auth token missing.',
			});
		}
		const result = await validate(token);
		return res.status(200).json(result);
	} catch (e) {
		console.log(e);
		const result = undefined;
		return res.status(404).json(result);
	}
};

export default a;
