const getHeaderValues = (headers, name) => headers.filter(header => header.name.toLowerCase() === name.toLowerCase()).map(header => header.value);

const updateHeader = (headers, name, value) => {
	const cb = typeof value === 'function' ? value : header => Object.assign(header, {value});

	for(let i = 0; i < headers.length; i++) {
		if (headers[i].name.toLowerCase() === name.toLowerCase()) {
			headers[i] = cb(headers[i]);
		}
	}
};

const setContentDispositionToInline = responseHeaders => {
	const disposition = getHeaderValues(responseHeaders, 'Content-Disposition')[0];

	if (disposition === undefined) {
		updateHeader(responseHeaders, 'Content-Disposition', 'inline');
		return;
	}

	const dispositions = disposition.split(/;\s*/);

	if (dispositions.includes('inline')) {
		return;
	}

	const attachmentIndex = dispositions.indexOf('attachment');

	if (attachmentIndex < 0) {
		dispositions.unshift('inline');
	} else {
		dispositions[attachmentIndex] = 'inline';
	}

	updateHeader(responseHeaders, 'Content-Disposition',  dispositions.join('; '));
};

chrome.webRequest.onHeadersReceived.addListener(
	details => {
		const {responseHeaders} = details;

		console.log(JSON.stringify({details}, null, 4));
		setContentDispositionToInline(responseHeaders);
		console.log(JSON.stringify({responseHeaders}, null, 4));

		return {responseHeaders};
	},
	{
		urls: ['<all_urls>'],
		types: ['main_frame','sub_frame']//,'stylesheet','script','image','object','xmlhttprequest','other']
	},
	['blocking', 'responseHeaders']
);
