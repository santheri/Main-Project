import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "./app/api/auth/[...nextauth]/auth";
import api from "./app/api";
import { AxiosError } from "axios";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
	const session = await getToken({
		req: request,
	});
	if (request.nextUrl.pathname.startsWith("/dashboard/exam")) {
		const pathSegments = request.nextUrl.pathname.split("/");
		const exam_id = pathSegments[pathSegments.length - 1];
		try {
			await api.get(`/api/questions?exam_id=${exam_id}`, {
				headers: {
					Authorization: `Bearer ${session?.access}`,
				},
			});
		} catch (error) {
			if (error instanceof AxiosError) {
				if (error.status === 404) {
					return NextResponse.redirect(
						new URL("/dashboard/exam-not-found", request.url)
					);
				}
			}
		}
		try {
			const res = await api.get(`/api/status/exam?exam_id=${exam_id}`, {
				headers: {
					Authorization: `Bearer ${session?.access}`,
				},
			});
			if (!res.data.is_open) {
				return NextResponse.redirect(
					new URL("/dashboard/exam-not-found", request.url)
				);
			}
		} catch (error) {
			if (error instanceof AxiosError) {
				if (error.status === 404) {
					return NextResponse.redirect(
						new URL("/dashboard/exam-not-found", request.url)
					);
				}
			}
		}
		try {
			const body = {
				student_email: session?.user?.email || "",
			};

			const response = await api.get(
				`/api/check_exam_assigned?student_email=${session?.user?.email}`
			);

			console.log("Response:", response.data);
		} catch (error) {
			if (error instanceof AxiosError) {
				if (error.status === 404) {
					return NextResponse.redirect(
						new URL("/dashboard/exam-already-taken", request.url)
					);
				}
			}
		}
	}
	if (request.nextUrl.pathname.startsWith("/admin-dashboard")) {
		if (session == null) {
			return NextResponse.redirect(
				new URL("/auth/login?redirecturl=/dashboard", request.url)
			);
		} else {
			if (!session.user.is_admin) {
				return NextResponse.redirect(new URL("/no-access", request.url));
			}
		}
	}
	if (request.nextUrl.pathname.includes("/dashboard")) {
		if (session == null) {
			return NextResponse.redirect(
				new URL("/auth/login?redirecturl=/dashboard", request.url)
			);
		}
	}
}

export const config = {
	matcher: ["/dashboard/exam/:path*", "/admin-dashboard"],
};
