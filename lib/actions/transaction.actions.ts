// "use server";

// import { ID, Query } from "node-appwrite";
// import { createAdminClient } from "../appwrite";
// import { parseStringify } from "../utils";
// import { updateBankAccountBalance } from "./bank.actions";

// const {
//   APPWRITE_DATABASE_ID: DATABASE_ID,
//   APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
//   APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
// } = process.env;

// // export const createTransaction = async (transaction: CreateTransactionProps) => {
// //   try {
// //     const { database } = await createAdminClient();

// //     const newTransaction = await database.createDocument(
// //       DATABASE_ID!,
// //       TRANSACTION_COLLECTION_ID!,
// //       ID.unique(),
// //       {
// //         channel: 'online',
// //         category: 'Transfer',
// //         ...transaction
// //       }
// //     )

// //     return parseStringify(newTransaction);
// //   } catch (error) {
// //     console.log(error);
// //   }
// // }

// export const createTransaction = async (
//   transaction: CreateTransactionProps
// ) => {
//   try {
//     const { database } = await createAdminClient();

//     // Create the transaction record
//     const newTransaction = await database.createDocument(
//       DATABASE_ID!,
//       TRANSACTION_COLLECTION_ID!,
//       ID.unique(),
//       {
//         channel: "online",
//         category: "Transfer",
//         ...transaction,
//       }
//     );

//     // Retrieve the sender and receiver bank accounts
//     const senderBankAccount = await database.getDocument(
//       DATABASE_ID!,
//       BANK_COLLECTION_ID!,
//       transaction.senderBankId
//     );

//     const receiverBankAccount = await database.getDocument(
//       DATABASE_ID!,
//       BANK_COLLECTION_ID!,
//       transaction.receiverBankId
//     );

//     // Calculate new balances
//     const senderAvailableBalance =
//       parseFloat(senderBankAccount.availableBalance) -
//       parseFloat(transaction.amount);
//     const senderCurrentBalance =
//       parseFloat(senderBankAccount.currentBalance) -
//       parseFloat(transaction.amount);

//     const receiverAvailableBalance =
//       parseFloat(receiverBankAccount.availableBalance) +
//       parseFloat(transaction.amount);
//     const receiverCurrentBalance =
//       parseFloat(receiverBankAccount.currentBalance) +
//       parseFloat(transaction.amount);

//     // Update bank account balances
//     await updateBankAccountBalance({
//       bankId: transaction.senderBankId,
//       availableBalance: senderAvailableBalance,
//       currentBalance: senderCurrentBalance,
//     });

//     await updateBankAccountBalance({
//       bankId: transaction.receiverBankId,
//       availableBalance: receiverAvailableBalance,
//       currentBalance: receiverCurrentBalance,
//     });

//     return parseStringify(newTransaction);
//   } catch (error) {
//     console.error("An error occurred while creating transaction:", error);
//     throw error;
//   }
// };

// export const getTransactionsByBankId = async ({
//   bankId,
// }: getTransactionsByBankIdProps) => {
//   try {
//     const { database } = await createAdminClient();

//     const senderTransactions = await database.listDocuments(
//       DATABASE_ID!,
//       TRANSACTION_COLLECTION_ID!,
//       [Query.equal("senderBankId", bankId)]
//     );

//     const receiverTransactions = await database.listDocuments(
//       DATABASE_ID!,
//       TRANSACTION_COLLECTION_ID!,
//       [Query.equal("receiverBankId", bankId)]
//     );

//     const transactions = {
//       total: senderTransactions.total + receiverTransactions.total,
//       documents: [
//         ...senderTransactions.documents,
//         ...receiverTransactions.documents,
//       ],
//     };

//     return parseStringify(transactions);
//   } catch (error) {
//     console.log(error);
//   }
// };
"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";
import { updateBankAccountBalance } from "./bank.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const createTransaction = async (
  transaction: CreateTransactionProps
) => {
  try {
    const { database } = await createAdminClient();

    // Retrieve the sender and receiver bank accounts
    const senderBankAccount = await database.getDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      transaction.senderBankId
    );

    const receiverBankAccount = await database.getDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      transaction.receiverBankId
    );

    // Parse balances
    const senderCurrentBalance = parseFloat(senderBankAccount.currentBalance);
    const transactionAmount = parseFloat(transaction.amount);

    // Check if the sender has enough balance
    if (senderCurrentBalance < transactionAmount) {
      throw new Error("Insufficient balance for the transaction.");
    }

    // Calculate new balances
    const senderAvailableBalance =
      parseFloat(senderBankAccount.availableBalance) - transactionAmount;
    const newSenderCurrentBalance = senderCurrentBalance - transactionAmount;

    const receiverAvailableBalance =
      parseFloat(receiverBankAccount.availableBalance) + transactionAmount;
    const receiverCurrentBalance =
      parseFloat(receiverBankAccount.currentBalance) + transactionAmount;

    // Create the transaction record
    const newTransaction = await database.createDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        channel: "online",
        category: "Transfer",
        ...transaction,
      }
    );

    // Update bank account balances
    await updateBankAccountBalance({
      bankId: transaction.senderBankId,
      availableBalance: senderAvailableBalance,
      currentBalance: newSenderCurrentBalance,
    });

    await updateBankAccountBalance({
      bankId: transaction.receiverBankId,
      availableBalance: receiverAvailableBalance,
      currentBalance: receiverCurrentBalance,
    });

    return parseStringify(newTransaction);
  } catch (error) {
    console.error("An error occurred while creating transaction:", error);
    throw error;
  }
};

export const getTransactionsByBankId = async ({
  bankId,
}: getTransactionsByBankIdProps) => {
  try {
    const { database } = await createAdminClient();

    const senderTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal("senderBankId", bankId)]
    );

    const receiverTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal("receiverBankId", bankId)]
    );

    const transactions = {
      total: senderTransactions.total + receiverTransactions.total,
      documents: [
        ...senderTransactions.documents,
        ...receiverTransactions.documents,
      ],
    };

    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
  }
};
