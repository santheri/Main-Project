import type { User } from "next-auth";
import type { Token } from "next-auth/jwt";

export interface CommonUser {
	username: string;
	email: string;
	exp: number;
	id: string;
	is_admin: boolean;
}

declare module "next-auth" {
	export interface User extends CommonUser {}

	export interface User extends Token {
		exp: number;
		user: CommonUser;
	}

	export interface Session {
		expires: string;
		exp: number;
		access: string;
		refresh: string;
		user: CommonUser;
	}
}
declare module "next-auth/jwt" {
	export interface RefreshedToken {
		access: string;
		refresh: string;
	}

	export interface Token extends RefreshedToken {
		refresh: string;
	}

	export interface JWT extends User {
		iat: number;
		jti: string;
	}

	export interface DecodedJWT extends User {
		token_type: string;
		exp: number;
		iat: number;
		jti: string;
	}
}
