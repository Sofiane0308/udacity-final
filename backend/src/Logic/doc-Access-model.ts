import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DocItem } from '../models/DocItem';
import { DocUpdate } from '../models/DocUpdate';

export class DocAccessDB {
  public constructor(
    private readonly documentClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly docs_Table = process.env.DOCS_TABLE,
  ) { }

  public async all(userId: string): Promise<DocItem[]> {
    const result = await this.documentClient
      .query({
        TableName: this.docs_Table,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();

    const items = result.Items;
    return items as DocItem[];
  }

  public async get(docId: string, userId: string): Promise<DocItem> {
    const result = await this.documentClient
      .query({
        TableName: this.docs_Table,
        KeyConditionExpression: 'docId = :docId and userId = :userId',
        ExpressionAttributeValues: {
          ':docId': docId,
          ':userId': userId,
        },
      })
      .promise();

    const item = result.Items[0];
    return item as DocItem;
  }

  public async create(docItem: DocItem): Promise<DocItem> {
    await this.documentClient
      .put({
        TableName: this.docs_Table,
        Item: docItem,
      })
      .promise();

    return docItem;
  }

  public async update(
    docId: string,
    createdAt: string,
    docUpdate: DocUpdate,
  ): Promise<void> {
    this.documentClient
      .update({
        TableName: this.docs_Table,
        Key: {
          docId,
          createdAt,
        },
        UpdateExpression:
          'set #n = :name, done = :done, dueDate = :dueDate',
        ExpressionAttributeValues: {
          ':name': docUpdate.name,
          ':done': docUpdate.done,
          ':dueDate': docUpdate.dueDate,
        },
        ExpressionAttributeNames: {
          '#n': 'name', 
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();
  }

  public async setAttachmentUrl(
    docId: string,
    userId: string,
    attachmentUrl: string,
  ): Promise<void> {
    this.documentClient
      .update({
        TableName: this.docs_Table,
        Key: {
          docId,
          userId,
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();
  }

  public async delete(docId: string, userId: string): Promise<void> {
    this.documentClient
      .delete({
        TableName: this.docs_Table,
        Key: {
          userId,
          docId,
        },
      })
      .promise();
  }
}
