import * as uuid from 'uuid';

import { DocItem } from '../models/DocItem';
import { DocAccessDB } from './doc-Access-model';
import { CreateDocRequest } from '../requests/CreateDocRequest';
import { parseUserId } from '../auth/utils';
import { UpdateDocRequest } from '../requests/UpdateDocRequest';

const docAccess = new DocAccessDB();

export async function getDocs(jwtToken: string): Promise<DocItem[]> {
    const userId = parseUserId(jwtToken);

    return docAccess.all(userId);
}

export async function createDoc(
    createDocRequest: CreateDocRequest,
    jwtToken: string,
): Promise<DocItem> {
    const itemId = uuid.v4();
    const userId = parseUserId(jwtToken);

    return docAccess.create({
        docId: itemId,
        userId: userId,
        name: createDocRequest.name,
        dueDate: createDocRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
    });
}

export async function update(
    docId: string,
    updateDocRequest: UpdateDocRequest,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const doc = await docAccess.get(docId, userId);

    docAccess.update(doc.docId, doc.createdAt, updateDocRequest);
}

export async function deleteDoc(
    docId: string,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const doc = await docAccess.get(docId, userId);

    await docAccess.delete(doc.docId, doc.userId);
}

export async function setAttachmentUrl(
    docId: string,
    attachmentUrl: string,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const doc = await docAccess.get(docId, userId);

    docAccess.setAttachmentUrl(doc.docId, doc.userId, attachmentUrl);
}