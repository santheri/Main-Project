import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
import type { DecodedJWT, JWT, RefreshedToken, Token } from "next-auth/jwt";
import { signOut } from "next-auth/react";
import { AxiosError } from "axios";
import api from "@/app/api";
import { backendUrl, login, refreshToken } from "@/constants/urls";

async function refreshAccessToken(token: JWT): Promise<JWT | null> {
	try {
		const res = await fetch(`${backendUrl}${refreshToken}`, {
			method: "POST",
			body: JSON.stringify({ refresh: token.refresh }),
			headers: { "Content-Type": "application/json" },
		});
		const refreshedToken: RefreshedToken = await res.json();

		if (res.status !== 200) throw refreshedToken;

		const { exp }: DecodedJWT = jwtDecode(refreshedToken.access);

		return {
			...token,
			...refreshedToken,
			exp,
		};
	} catch (error) {
		await signOut();
		return {
			...token,
			error: "RefreshAccessTokenError",
		};
	}
}

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: "/auth/login",
		error: "/auth/error",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET as string,
	providers: [
		CredentialsProvider({
			id: "customsignin",
			type: "credentials",
			credentials: {
				username: { label: "username", type: "username" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				try {
					const res = await api.post(login, credentials);
					if (res.status !== 200) throw res.data;
					const retrievedToken: Token = res.data;
					const { username, email, id, exp, is_admin }: DecodedJWT = jwtDecode(
						retrievedToken.access
					);
					return {
						...retrievedToken,
						exp,
						user: {
							username,
							email,
							id,
							is_admin,
						},
					} as unknown as User;
				} catch (e) {
					const error: AxiosError = e as AxiosError;

					const te = error.response?.data as any;
					if (te && te.detail) {
						throw new Error(te.detail as string, {
							cause: te.detail as string,
						});
					}

					const temp: any =
						error.response?.data || error.code === "ECONNREFUSED"
							? "Network Error"
							: error;
					throw new Error(
						(temp.detail as string) || error.code === "ECONNREFUSED"
							? "Network Error"
							: error.code,
						{
							cause:
								temp.detail || error.code === "ECONNREFUSED"
									? "Network Error"
									: error,
						}
					);
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger, account, session }) {
			if (user && account) {
				return user as JWT;
			}
			if (Date.now() < token.exp * 100) {
				return token;
			}
			const result = (await refreshAccessToken(token)) as JWT;
			if (result.error) {
				throw Error("SessionExpiredError");
			} else {
				return result;
			}
		},
		async session({ session, token }) {
			session.access = token.access;
			session.user = token.user;
			session.exp = token.exp;
			session.refresh = token.refresh;
			return session;
		},
	},
};
