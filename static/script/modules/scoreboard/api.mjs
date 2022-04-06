let token;
export const requestToken = async () => {
  token = await (await fetch(`${URL_BASE}/score/token`, { method: 'POST'})).text();
}

export const submitScore = async (username, score) => {
  if(username.length < 1) throw new Error();
  return fetch(`${URL_BASE}/score/submit`, {
    method: 'POST', headers: {"Content-Type": "application/json"},
    body: JSON.stringify({token: token, score, username})});
}

export const fetchScores = async () => {
  return await (await fetch(`${URL_BASE}/scores`, {method: 'GET'})).json();
}