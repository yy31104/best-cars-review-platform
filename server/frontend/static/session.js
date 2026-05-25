(function () {
  const addNavClass = (element) => {
    element.className = "homepage_links bc-nav-link";
    return element;
  };

  const createLink = (label, href) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    return addNavClass(link);
  };

  const logout = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const res = await fetch("/djangoapp/logout", {
      method: "GET"
    });
    const json = await res.json();

    if (json) {
      sessionStorage.clear();
      window.location.href = "/";
    } else {
      alert("The user could not be logged out.");
    }
  };

  const checkSession = () => {
    const sessionTarget = document.getElementById("loginlogout");
    if (!sessionTarget) {
      return;
    }

    const currUser = sessionStorage.getItem("username");
    sessionTarget.innerHTML = "";

    if (currUser && currUser !== "") {
      const username = document.createElement("span");
      username.textContent = currUser;
      addNavClass(username);

      const logoutLink = createLink("Logout", "/");
      logoutLink.addEventListener("click", logout);

      sessionTarget.append(username, logoutLink);
    } else {
      sessionTarget.append(
        createLink("Login", "/login"),
        createLink("Register", "/register")
      );
    }
  };

  window.logout = logout;
  window.checkSession = checkSession;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkSession);
  } else {
    checkSession();
  }
})();
