import fetch from "node-fetch"

const requestGithubToken = async (credentials) => {
  console.log(JSON.stringify(credentials));
    const res = await fetch(`https://github.com/login/oauth/access_token?`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });
    console.log(res)
    const res_json = await res.json();
    console.log(res_json)
    return res_json;
};

const requestGithubUserAccount = async (token) => {
  const res = await fetch(`https://api.github.com/user`, {
    method: "POST",
    headers: {
      Authorization: `token ${token}`,
    },
  });
  return await res.json();
};

export const authorizeWithGithub = async (credentials) => {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
};
