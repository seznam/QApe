module.exports = {
	defaultBrowserSettings: {
		ignoreHTTPSErrors: true,
		defaultViewport: {
			width: 1280,
			height: 720
		},
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--start-maximized',
			'--user-agent=Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
		]
	},
	stopNewScenariosAfterTime: 0
}