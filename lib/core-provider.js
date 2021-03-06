'use babel';

// data source is an array of objects
import suggestions from '../data/kamailio_5_1_x_core';

class IntermediateProvider {
	constructor() {
		// offer suggestions only when editing plain text or HTML files
		this.selector = '.source.kamailio';
	}

	getSuggestions(options) {
		const { prefix } = options;

		// only look for suggestions after 3 characters have been typed
		if (prefix.length >= 2) {
			return this.findMatchingSuggestions(prefix);
		}
	}

	findMatchingSuggestions(prefix) {
		// filter list of suggestions to those matching the prefix, case insensitive
		let prefixLower = prefix.toLowerCase();
		let matchingSuggestions = suggestions.filter((suggestion) => {
			let textLower = suggestion.text.toLowerCase();
			return textLower.startsWith(prefixLower);
		});

		// run each matching suggestion through inflateSuggestion() and return
		return matchingSuggestions.map(this.inflateSuggestion);
	}

	// clones a suggestion object to a new object with some shared additions
	// cloning also fixes an issue where selecting a suggestion won't insert it
	inflateSuggestion(suggestion) {
		let inflatedSuggestion = {
			text: suggestion.text,
			description: suggestion.description,
			descriptionMoreURL: suggestion.descriptionMoreURL,
			type: suggestion.type,
			rightLabel: suggestion.rightLabel
		};

		if (suggestion.snippet !== undefined) {
			inflatedSuggestion.snippet = suggestion.snippet;
		}

		return inflatedSuggestion;

	}
}
export default new IntermediateProvider();
