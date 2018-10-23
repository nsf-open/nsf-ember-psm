(function() {
  var DEFAULT_TIMEOUT = 4000;
  var query = location.search.substring(1);
  var pos = query.indexOf('=');
  var redirectUrl = query.substring(pos + 1);
  redirectUrl = decodeURIComponent(redirectUrl);
  redirectUrl = redirectUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  var redirectToUrl = function(event) {
    if(event && event.preventDefault) {
      event.preventDefault();
    }

    location.replace(redirectUrl);
  };

  window.onload = function () {
    var redirectLinkElement = document.getElementById('redirect-link');
    redirectLinkElement.innerHTML = redirectUrl;
    redirectLinkElement.href = redirectUrl
    redirectLinkElement.addEventListener('click', redirectToUrl);
  };

  setTimeout(redirectToUrl, DEFAULT_TIMEOUT);
}());
