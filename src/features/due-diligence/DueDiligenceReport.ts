class DueDiligenceReport {
  constructor(
    public financialMetrics: any,
    public newsSentiment: any,
    public competitiveLandscape: any,
    public riskProfile: any,
    public scenarioOutcomes: any,
    public narrative: string = '',
    public summaryData: any = {}
  ) {}
}

export { DueDiligenceReport };
