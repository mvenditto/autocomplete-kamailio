'use babel';

import suggestions from '../data/kamailio_5_1_x_transformations';

class TransformationsProvider {
	constructor() {
		this.selector = '.source.kamailio';
		this.disableForSelector = '.source.kamailio .comment';
		//this.suggestionPriority = 2;
	}

	getSuggestions(options) {
		const { editor, bufferPosition } = options;

		let prefix = this.getPrefix(editor, bufferPosition);

		if (prefix.startsWith('{')) {
			return this.findMatchingSuggestions(prefix);
		}
	}

	getPrefix(editor, bufferPosition) {
		let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
		let match = line.match(/\S+$/);
		return match ? match[0] : '';
	}

	findMatchingSuggestions(prefix) {
		let matchingSuggestions = suggestions.filter((suggestion) => {
			return suggestion.text.startsWith(prefix);
		});

		let inflateSuggestion = this.inflateSuggestion.bind(this, prefix);
		return matchingSuggestions.map(inflateSuggestion);
	}

	inflateSuggestion(replacementPrefix, suggestion) {
		let inflatedSuggestion = {
			displayText: suggestion.displayText,
			description: suggestion.description,
			iconHTML: '<i class="transformation-icon"></i>',
			type: suggestion.type, //snippet
			rightLabelHTML: suggestion.rightLabel //'<span class="aab-right-label">Snippet</span>' // look in /styles/atom-slds.less
		};

		if (suggestion.snippet !== undefined) {
			inflatedSuggestion.snippet = suggestion.snippet;
			inflatedSuggestion.replacementPrefix = replacementPrefix; // ensures entire prefix is replaced
		} else {
			inflatedSuggestion.text = suggestion.text
		}

		return inflatedSuggestion;
	}

	onDidInsertSuggestion(options) {
		//atom.notifications.addSuccess(options.suggestion.displayText + ' was inserted.');
	}
}
export default new TransformationsProvider();
