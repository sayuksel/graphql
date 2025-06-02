export const GET_USER_PROFILE = `
  query GetUserProfile {
    user {
      id
      firstName
      lastName
      login
      email
    }
  }
`;

export const GET_XP_TRANSACTIONS = `
  query GetXPTransactions($userId: Int!) {
    transaction(
      where: { 
        type: { _eq: "xp" },
        userId: { _eq: $userId }
      },
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
      where: { userId: { _eq: $userId } },
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