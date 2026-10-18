import * as analytics from "@/server/analytics";
import { HttpError, notFound, route } from "@/server/http";
import { getWorkspace } from "@/server/resources";

const reports = {
  summary: analytics.summary,
  timeseries: analytics.timeseries,
  receivers: analytics.receivers,
  events: analytics.topEvents,
};

export const GET = route<{ id: string; report: string }>(async ({ req, params, user }) => {
  const workspace = await getWorkspace(user.id, params.id);
  const range = analytics.parseRange(req, workspace);

  if (params.report === "export") {
    if (!workspace.analytics_enabled) throw new HttpError(403, "Analytics not enabled");
    return new Response(await analytics.exportCsv(workspace, range), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-${workspace.workspace_identifier}.csv"`,
      },
    });
  }

  const report = reports[params.report as keyof typeof reports];
  if (!report) throw notFound("Report");
  if (!workspace.analytics_enabled) return { enabled: false };
  return report(workspace, range);
});
