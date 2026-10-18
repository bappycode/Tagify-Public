import "server-only";
import { z } from "zod";
import { auth } from "@/lib/auth";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} not found`);

interface Context<P> {
  req: Request;
  params: P;
  user: { id: string; role: string };
}

export function route<P = Record<string, never>>(
  handler: (ctx: Context<P>) => Promise<unknown>,
  { admin = false } = {},
) {
  return async (req: Request, { params }: { params: Promise<P> }) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) throw new HttpError(401, "Not signed in");

      const user = { id: session.user.id, role: session.user.role ?? "user" };
      if (admin && user.role !== "admin") throw new HttpError(403, "Admin access required");

      const result = await handler({ req, params: await params, user });
      return result instanceof Response ? result : Response.json(result ?? { success: true });
    } catch (err) {
      if (err instanceof HttpError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return Response.json({ error: "Server error" }, { status: 500 });
    }
  };
}

export async function readBody<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  const json = await req.json().catch(() => ({}));
  const result = schema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path.join(".");
    throw new HttpError(400, field ? `${field}: ${issue?.message}` : "Invalid request");
  }
  return result.data;
}
