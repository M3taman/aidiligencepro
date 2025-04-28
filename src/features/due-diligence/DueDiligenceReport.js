class DueDiligenceReport {
    financialMetrics;
    newsSentiment;
    competitiveLandscape;
    riskProfile;
    scenarioOutcomes;
    narrative;
    summaryData;
    constructor(financialMetrics, newsSentiment, competitiveLandscape, riskProfile, scenarioOutcomes, narrative = '', summaryData = {}) {
        this.financialMetrics = financialMetrics;
        this.newsSentiment = newsSentiment;
        this.competitiveLandscape = competitiveLandscape;
        this.riskProfile = riskProfile;
        this.scenarioOutcomes = scenarioOutcomes;
        this.narrative = narrative;
        this.summaryData = summaryData;
    }
}
export { DueDiligenceReport };
