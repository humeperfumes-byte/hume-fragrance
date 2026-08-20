type ReportCandidate = {
  status: string;
  inputHash: string;
  createdAt: Date;
};

export function shouldReuseCompletedAiReport(
  latest: ReportCandidate | null | undefined,
  inputHash: string,
  now: Date,
  ttlMs: number,
) {
  return Boolean(
    latest?.status === "completed" &&
      latest.inputHash === inputHash &&
      now.getTime() - latest.createdAt.getTime() < ttlMs,
  );
}
