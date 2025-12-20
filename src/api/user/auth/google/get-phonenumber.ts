export async function getPhoneNumber(accessToken: string) {
    const res = await fetch('https://people.googleapis.com/v1/people/me?personFields=phoneNumbers', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await res.json();
    return data.phoneNumbers?.[0]?.value;
}
