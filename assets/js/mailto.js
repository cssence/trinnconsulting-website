(function (document) {
	"use strict";
	if ("querySelectorAll" in document) {
		[].forEach.call(document.querySelectorAll(".email"), function (plain) {
			var anchor = document.createElement("a");
			anchor.className = "email";
			anchor.href = "mail" + "to:" + plain.textContent;
			anchor.innerHTML = plain.innerHTML;
			plain.classList.remove("email");
			plain.innerHTML = "";
			plain.appendChild(anchor);
		});
	}
}(document));
