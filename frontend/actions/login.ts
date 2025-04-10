import { signIn } from "next-auth/react";
import { existingUser, existingUserSchema } from "@/types/types";

export async function loginUser(props: existingUser): Promise<{
  status: "success" | "error";
  message: string;
}> {
  const result = existingUserSchema.safeParse(props);
  if (!result.success) {
    let errorMessage = "";
    result.error.issues.forEach((issue) => {
      errorMessage =
        errorMessage + issue.path[0] + " : " + issue.message + ".\n";
    });
    return {
      status: "error",
      message: errorMessage,
    };
  }
  const signInResponse = await signIn("customsignin", {
    redirect: false,
    username: props.username,
    password: props.password,
  });
  if (signInResponse && !signInResponse.error) {
    return {
      status: "success",
      message: "you have been successfully logged in",
    };
  } else {
    console.log(signInResponse);
    return {
      status: "error",
      message: signInResponse?.error || "Network Error",
    };
  }
}