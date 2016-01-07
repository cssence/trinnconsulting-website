(function (document) {
	"use strict";
	if ("querySelectorAll" in document) {
		var container = document.querySelector("main");
		if (container && location.search.indexOf("?print") === 0) {
			var data = {};
			var pages = document.querySelectorAll(".page-break").length;
			var header = document.querySelector(".article-header");
			var rearrange = document.querySelector(".content");
			var footer = document.createElement("footer");
			var partner = location.search.split("=");
			if (location.search.indexOf("=") !== -1) {
				var partnerImage = document.createElement("img");
				partnerImage.src = location.search.split("=")[1];
				partnerImage.className = "partner-image";
				var partnerFrame = document.createElement("p");
				partnerFrame.className = "partner-image-frame";
				partnerFrame.appendChild(partnerImage);
				header.appendChild(partnerFrame);
			}
			footer.className = "company";
			footer.appendChild(document.querySelector("footer.site .company-logo").cloneNode());
			footer.appendChild(document.querySelector("footer.site .company-name").cloneNode(true));
			container.removeChild(header);
			container.removeChild(rearrange);
			var items = new Array(pages + 1);
			var item;
			var page = 0;
			while ((item = rearrange.firstChild) !== null) {
				if (item.className.split(" ").indexOf("page-break") !== -1) {
					items[page += 1] = [];
				}
				items[page].push(item);
				rearrange.removeChild(item);
			}
			for (page = 1; page <= pages; page += 1) {
				var sheet = document.createElement("div");
				sheet.className = "page";
				sheet.appendChild(header.cloneNode(true));
				var content = document.createElement("div");
				content.className = "content";
				items[page].forEach(function (item) {
					content.appendChild(item);
				});
				sheet.appendChild(content);
				footer = footer.cloneNode(true);
				footer.setAttribute("data-page", page);
				footer.setAttribute("data-pages", pages);
				sheet.appendChild(footer);
				container.appendChild(sheet);
			}
			var addStyles = document.createElement("link");
			addStyles.rel = "stylesheet";
			addStyles.href = "/css/team-print.css";
			document.querySelector("head").appendChild(addStyles);
		}
	}
}(document));
