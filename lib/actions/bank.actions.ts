"use server";

import {
  ACHClass,
  CountryCode,
  TransferAuthorizationCreateRequest,
  TransferCreateRequest,
  TransferNetwork,
  TransferType,
} from "plaid";

import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";
import { createAdminClient } from "../appwrite";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

// Get multiple bank accounts
// export const getAccounts = async ({ userId }: getAccountsProps) => {
//   try {
//     // get banks from db
//     const banks = await getBanks({ userId });

//     console.log(banks[0]);

//     const accounts = await Promise.all(
//       banks?.map(async (bank: Bank) => {
//         // get each account info from plaid
//         const accountsResponse = await plaidClient.accountsGet({
//           access_token: bank.accessToken,
//         });
//         const accountData = accountsResponse.data.accounts[0];
//         // console.log(accountData)

//         // get institution info from plaid
//         const institution = await getInstitution({
//           institutionId: accountsResponse.data.item.institution_id!,
//         });

      
//         const account = {
//           id: accountData.account_id,
//           availableBalance: banks[0].currentBalance!,
//           currentBalance: banks[0].availableBalance!,
//           institutionId: institution.institution_id,
//           name: accountData.name,
//           officialName: accountData.official_name,
//           mask: accountData.mask!,
//           type: accountData.type as string,
//           subtype: accountData.subtype! as string,
//           appwriteItemId: bank.$id,
//           shareableId: bank.shareableId,
//         };

//         return account;
//       })
//     );

//     const totalBanks = accounts.length;
//     const totalCurrentBalance = accounts.reduce((total, account) => {
//       return total + account.currentBalance;
//     }, 0);

//     return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
//   } catch (error) {
//     console.error("An error occurred while getting the accounts:", error);
//   }
// };

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get banks from db
    const banks = await getBanks({ userId });

    console.log(banks[0]);

    const accounts = await Promise.all(
      banks.map(async (bank: Bank) => {
        // get each account info from plaid
        const accountsResponse = await plaidClient.accountsGet({
          access_token: bank.accessToken,
        });
        const accountData = accountsResponse.data.accounts[0];
        // console.log(accountData)

        // get institution info from plaid
        const institution = await getInstitution({
          institutionId: accountsResponse.data.item.institution_id!,
        });

        const account = {
          id: accountData.account_id,
          availableBalance: bank.availableBalance!, // Use bank.availableBalance
          currentBalance: bank.currentBalance!, // Use bank.currentBalance
          institutionId: institution.institution_id,
          name: accountData.name,
          officialName: accountData.official_name,
          mask: accountData.mask!,
          type: accountData.type as string,
          subtype: accountData.subtype! as string,
          appwriteItemId: bank.$id,
          shareableId: bank.shareableId,
        };

        return account;
      })
    );

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => {
      return total + account.currentBalance;
    }, 0);

    const totalAvailableBalance = accounts.reduce((total, account) => {
      return total + account.availableBalance;
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance, totalAvailableBalance });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};


// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // get bank from db
    const bank = await getBank({ documentId: appwriteItemId });

    // get account info from plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData = accountsResponse.data.accounts[0];

    // get transfer transactions from appwrite
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferTransactions = transferTransactionsData.documents.map(
      (transferData: Transaction) => ({
        id: transferData.$id,
        name: transferData.name!,
        amount: transferData.amount!,
        date: transferData.$createdAt,
        paymentChannel: transferData.channel,
        category: transferData.category,
        type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      })
    );

    // get institution info from plaid
    const institution = await getInstitution({
      institutionId: accountsResponse.data.item.institution_id!,
    });

    const transactions = await getTransactions({
      accessToken: bank?.accessToken,
    });

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available!,
      currentBalance: accountData.balances.current!,
      institutionId: institution.institution_id,
      name: accountData.name,
      officialName: accountData.official_name,
      mask: accountData.mask!,
      type: accountData.type as string,
      subtype: accountData.subtype! as string,
      appwriteItemId: bank.$id,
    };

    // sort transactions by date such that the most recent transaction is first
    const allTransactions = [...transactions, ...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let transactions: any = [];

  try {
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
      });

      const data = response.data;

      transactions = response.data.added.map((transaction) => ({
        id: transaction.transaction_id,
        name: transaction.name,
        paymentChannel: transaction.payment_channel,
        type: transaction.payment_channel,
        accountId: transaction.account_id,
        amount: transaction.amount,
        pending: transaction.pending,
        category: transaction.category ? transaction.category[0] : "",
        date: transaction.date,
        image: transaction.logo_url,
      }));

      hasMore = data.has_more;
    }

    return parseStringify(transactions);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

export const updateBankAccountBalance = async ({
  bankId,
  availableBalance,
  currentBalance,
}: {
  bankId: string;
  availableBalance: number;
  currentBalance: number;
}) => {
  try {
    const { database } = await createAdminClient();

    // Retrieve the bank account document
    const bankAccount = await database.getDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      bankId
    );

    // Update the bank account document with new balances
    const updatedBankAccount = await database.updateDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      bankId,
      {
        availableBalance,
        currentBalance,
      }
    );

    return parseStringify(updatedBankAccount);
  } catch (error) {
    console.error(
      "An error occurred while updating bank account balance:",
      error
    );
    throw error;
  }
};
