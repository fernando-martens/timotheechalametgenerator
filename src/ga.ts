/**
 * These function register the event on google analytics
 * @param evName 
 * @param params  
 */
export function registerGoogleAnalyticsEvent(evName: string, params?: object){
	if (!evName) return;
 
	if (!params) params = {};
 
	if (import.meta.env.DEV) {
		console.info({
			evName,
			params
		});
		return;
	}
 
	// @ts-ignore gtag is on head of index.html
	gtag("event", evName, {
		...params
	});
}