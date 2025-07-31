export const GET_USER_PROFILE = `
  query GetUserProfile {
    user {
      id
      firstName
      lastName
      login
      email
      createdAt
    }
  }
`;

export const GET_XP_TRANSACTIONS = `
  query GetXPTransactions($userId: Int!) {
    transaction(
      where: {
      _and: [
        { type: { _eq: "xp" } },
        { userId: { _eq: $userId } },
        { createdAt: { _gte: "2024-04-28T15:04:29.523441+00:00" } },
        {
          _or: [
            { path: { _nlike: "/bahrain/bh-module/piscine-js%" } },
            {
              _and: [
                { path: { _like: "/bahrain/bh-module/piscine-js%" } },
                { object: { type: { _eq: "piscine" } } }
              ]
            }
          ]
        }
      ]
    }
      order_by: { createdAt: asc }
    ) {
      id
      amount
      createdAt
      path
      object {
        name
        type
      }
    }
  }
`;

export const GET_PROGRESS = `
  query GetProgress($userId: Int!) {
    progress(
      where: {
        userId: { _eq: $userId }
        object: { type: { _eq: "project" } }
      },
      order_by: { createdAt: desc }
      
    ) {
      id
      grade
      createdAt
      updatedAt
      path
      object {
        name
        type
      }
    }
  }
`;

export const GET_RESULTS = `
  query GetResults($userId: Int!) {
    result(
      where: { userId: { _eq: $userId } },
      order_by: { updatedAt: desc }
    ) {
      id
      grade
      type
      createdAt
      updatedAt
      path
      object {
        name
        type
      }
    }
  }
`;

export const AUDITS_MADE = `
  query auditsDown($login: String!) {
    transaction(
      where: {
        type: {_eq: "down" }
        user: { login: { _eq: $login } }
      }
      order_by: { createdAt: asc }
    ) {
      amount
      createdAt
    }
  }
`;

export const AUDITS_GOT = `
  query auditsUp($login: String!) {
    transaction(
      where: {
        type: {_eq: "up" }
        user: { login: { _eq: $login } }
      }
      order_by: { createdAt: asc }
    ) {
      amount
      createdAt
    }
  }
`;