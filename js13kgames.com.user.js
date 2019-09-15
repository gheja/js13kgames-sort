// ==UserScript==
// @name         js13kgames sort
// @namespace    https://github.com/gheja/js13kgames-sort
// @version      0.1
// @description  add sort options for js13kgames entries page
// @author       Gabor Heja
// @match        http://js13kgames.com/entries*
// @grant        none
// ==/UserScript==

(function() {
	'use strict';
	
	let _currentSortOrder, _randomSeed, _randomState
	
	function loadSettings()
	{
		let a;
		
		a = window.localStorage.getItem("js13k.sort.order");
		_currentSortOrder = a !== null ? parseInt(a) : 0;
		
		a = window.localStorage.getItem("js13k.sort.randomSeed");
		_randomSeed = a !== null ? parseInt(a) : Math.floor(Math.random() * 1000000);
	}
	
	function saveSettings()
	{
		window.localStorage.setItem("js13k.sort.order", _currentSortOrder);
		window.localStorage.setItem("js13k.sort.randomSeed", _randomSeed);
	}
	
	function randomReset()
	{
		_randomState = _randomSeed;
	}
	
	function randomValue(min, max)
	{
		_randomState = (_randomState * 94857) % 431371;
		
		return (_randomState % (max - min)) + min;
	}
	
	function applySortOrder()
	{
		let entries, root, entries2, a;
		
		// restore random generator to seed;
		randomReset();
		
		entries = [...document.getElementsByClassName("entry")];
		entries2 = [...document.getElementsByClassName("entry")];
		root = entries[0].parentNode;
		
		if (_currentSortOrder == 0)
		{
			// latest first
			entries2.sort(function(a, b) { return a.dataset.originalOrderIndex - b.dataset.originalOrderIndex; });
		}
		else if (_currentSortOrder == 1)
		{
			// earliest first
			entries2.sort(function(a, b) { return b.dataset.originalOrderIndex - a.dataset.originalOrderIndex; });
		}
		else if (_currentSortOrder == 2)
		{
			// random -
			
			// restore original sort before
			entries2.sort(function(a, b) { return a.dataset.originalOrderIndex - b.dataset.originalOrderIndex; });
			
			// assign a random number to each entry
			for (a of entries2)
			{
				a.dataset.randomValue = randomValue(0, 100000);
			}
			
			// sort by the random number
			entries2.sort(function(a, b) { return a.dataset.randomValue - b.dataset.randomValue; });
		}
		
		// remove all entries
		for (a of entries)
		{
			a.parentNode.removeChild(a);
		}
		
		// repopulate list in wanted order
		for (a of entries2)
		{
			root.appendChild(a);
		}
	}
	
	function updateSelectStyle()
	{
		let a;
		
		for (a of document.getElementsByClassName("sort-li"))
		{
			if (a.dataset.order == _currentSortOrder)
			{
				// add active style
				a.style.color = "#000";
				a.style.textDecoration = "none";
			}
			else
			{
				// reset style
				a.style.color = null;
				a.style.textDecoration = null;
			}
		}
	}
	
	function changeSortOrder(event)
	{
		_currentSortOrder = event.target.dataset.order;
		applySortOrder();
		updateSelectStyle();
		saveSettings();
		return false;
	}
	
	let entriesDiv, a, b, ul, tmp, tmp2, i;
	
	// add a property to store the default order
	i = 0;
	for (b of document.getElementsByClassName("entry"))
	{
		b.dataset.originalOrderIndex = i;
		i++;
	}
	
	// the new list to hold the sort options
	ul = document.createElement("ul");
	ul.className = "editions";
	
	// generate sort options and append them to the list
	tmp2 = document.createElement("a");
	tmp2.innerHTML = "Random sort";
	tmp2.className = "sort-li";
	tmp2.href = "#";
	tmp2.onclick = changeSortOrder;
	tmp2.dataset.order = 2;
	
	tmp = document.createElement("li");
	tmp.appendChild(tmp2);
	ul.appendChild(tmp);
	
	
	tmp2 = document.createElement("a");
	tmp2.innerHTML = "Latest first";
	tmp2.className = "sort-li";
	tmp2.href = "#";
	tmp2.onclick = changeSortOrder;
	tmp2.dataset.order = 0;
	
	tmp = document.createElement("li");
	tmp.appendChild(tmp2);
	ul.appendChild(tmp);
	
	
	tmp2 = document.createElement("a");
	tmp2.innerHTML = "Earliest first";
	tmp2.className = "sort-li";
	tmp2.dataset.order = 1;
	tmp2.href = "#";
	tmp2.onclick = changeSortOrder;
	
	tmp = document.createElement("li");
	tmp.appendChild(tmp2);
	ul.appendChild(tmp);
	
	entriesDiv = document.getElementById("entries");
	
	// find the next element after the second "editions" ul and insert our list before it
	a = entriesDiv.getElementsByClassName("editions");
	a = a[1].nextSibling;
	entriesDiv.insertBefore(ul, a);
	
	loadSettings();
	applySortOrder();
	updateSelectStyle();
})();
