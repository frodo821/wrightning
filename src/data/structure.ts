/**
 * A node representing a text.
 */
export interface TextNode {
  type: 'text';
  text: string;
  title: string;
  memo: string;
  id: string;
}

/**
 * A node representing a paragraph.
 */
export interface ParagraphNode {
  type: 'paragraph';
  children: DataNode[];
  title: string;
  memo: string;
  id: string;
}

export type DataNode = TextNode | ParagraphNode;
export type NodeType = DataNode['type'];

/**
 * Intermediate form among DataNodes.
 */
export interface ConversionNode {
  type: NodeType;
  children?: DataNode[];
  text?: string;
  title: string;
  memo: string;
  id: string;
}

/**
 * Generates a UUID-like random string.
 * @returns {string} A random string.
 */
function generateId(): string {
  const timestamp = BigInt(Date.now()) ^ 0xffffffffffffffffn;
  const random = (
    timestamp ^
    (BigInt(Math.floor(Math.random() * 0xffffffff)) << 32n) ^
    BigInt(Math.floor(Math.random() * 0xffffffff))
  ).toString(16);
  const [d4, d2] = random
    .padStart(16, '0')
    .match(/^(.{12})(.{4})$/)!
    .slice(1);
  const [_, d0, d1] = timestamp
    .toString(16)
    .match(/^(.{4})(.{8})(.{4})$/)!
    .slice(1);
  const d3 = Math.floor(Math.random() * 0xffff).toString(16);

  return `${d0}-${d1}-${d2}-${d3}-${d4}`;
}

/**
 * checks if the ConversionNode is a TextNode.
 * @param node a ConversionNode.
 * @returns {node is TextNode} `true` if the node is a TextNode, `false` otherwise.
 */
export function isTextNode(node: ConversionNode): node is TextNode {
  return node.type === 'text';
}

/**
 * checks if the ConversionNode is a ParagraphNode.
 * @param node a ConversionNode.
 * @returns {node is ParagraphNode} `true` if the node is a ParagraphNode, `false` otherwise.
 */
export function isParagraphNode(node: ConversionNode): node is ParagraphNode {
  return node.type === 'paragraph';
}

/**
 * creates a new TextNode.
 * @param text initial text.
 * @param title initial title.
 * @param memo initial text of memorandum about the node.
 * @returns a new TextNode.
 */
export function createTextNode(text: string, title?: string, memo?: string): TextNode {
  title ??= '';
  memo ??= '';

  return {
    type: 'text',
    text,
    title,
    memo,
    id: generateId(),
  };
}

/**
 * creates a new ParagraphNode.
 * @param children initial children nodes.
 * @param title initial title.
 * @param memo initial text of memorandum about the node.
 * @returns a new ParagraphNode.
 */
export function createParagraphNode(
  children?: DataNode[],
  title?: string,
  memo?: string,
): ParagraphNode {
  children ??= [];
  title ??= '';
  memo ??= '';

  return {
    type: 'paragraph',
    children,
    title,
    memo,
    id: generateId(),
  };
}

/**
 * splits a TextNode into two TextNodes at the given text offset.
 * @param node a TextNode to split.
 * @param offset text offset to split.
 * @returns a tuple of two TextNodes.
 */
export function splitTextNode(node: TextNode, offset: number): [TextNode, TextNode] {
  return [createTextNode(node.text.slice(0, offset)), createTextNode(node.text.slice(offset))];
}

/**
 * convert a TextNode to a ParagraphNode and insert a node after the original text.
 * Note that this function is destructive to the original node.
 * @param node a TextNode to convert.
 * @param newNode a DataNode to insert.
 * @param copyInformation copy title and memo to the first new child.
 * @returns this node
 */
export function insertNewNodeAfterTextNode(
  node: TextNode,
  newNode: DataNode,
  copyInformation?: boolean,
): ParagraphNode {
  const thisNode: ConversionNode = node as DataNode;

  thisNode.type = 'paragraph';
  thisNode.children = [
    copyInformation ? createTextNode(node.text, node.title, node.memo) : createTextNode(node.text),
    newNode,
  ];
  delete thisNode.text;

  if (isParagraphNode(thisNode)) {
    return thisNode;
  }

  throw new Error('unhandled internal error');
}

/**
 * convert a TextNode to a ParagraphNode and insert a node before the original text.
 * Note that this function is destructive to the original node.
 * @param node a TextNode to convert.
 * @param newNode a DataNode to insert.
 * @param copyInformation copy title and memo to the second new child. 
 * @returns this node
 */
export function insertNewNodeBeforeTextNode(
  node: TextNode,
  newNode: DataNode,
  copyInformation?: boolean,
): ParagraphNode {
  const thisNode: ConversionNode = node as DataNode;

  thisNode.type = 'paragraph';
  thisNode.children = [
    newNode,
    copyInformation ? createTextNode(node.text, node.title, node.memo) : createTextNode(node.text),
  ];
  delete thisNode.text;

  if (isParagraphNode(thisNode)) {
    return thisNode;
  }

  throw new Error('unhandled internal error');
}

export function insertNewNodeToTextNode(
  node: TextNode,
  newNode: DataNode,
  offset: number,
): ParagraphNode {
  const thisNode: ConversionNode = node as DataNode;

  thisNode.type = 'paragraph';
  thisNode.children = [
    createTextNode(node.text.slice(0, offset)),
    newNode,
    createTextNode(node.text.slice(offset)),
  ];
  delete thisNode.text;

  if (isParagraphNode(thisNode)) {
    return thisNode;
  }

  throw new Error('unhandled internal error');
}

export function insertNewNodeToParagraphNode(
  node: ParagraphNode,
  newNode: DataNode,
  offset: number,
): ParagraphNode {
  node.children = [...node.children.slice(0, offset), newNode, ...node.children.slice(offset)];
  return node;
}

export function flattenParagraphNodeAt(node: ParagraphNode, offset: number): ParagraphNode {
  const obj = node.children[offset];

  node.children = [
    ...node.children.slice(0, offset),
    ...(obj.type === 'paragraph' ? obj.children : [obj]),
    ...node.children.slice(offset + 1),
  ];

  return node;
}

export function removeNodeAtFromParagraphNode(node: ParagraphNode, offset: number): ParagraphNode {
  if (offset !== 0 && offset !== node.children.length - 1) {
    node.children = [...node.children.slice(0, offset), ...node.children.slice(offset + 1)];
  } else if (offset === 0) {
    node.children = [...node.children.slice(1)];
  } else {
    node.children = [...node.children.slice(0, offset)];
  }

  return node;
}

export function removeNodeFromParagraphNode(node: ParagraphNode, target: DataNode): ParagraphNode {
  const index = node.children.indexOf(target);
  if (index === -1) {
    return node;
  }

  return removeNodeAtFromParagraphNode(node, index);
}

export function canonicalizeNodes(node: DataNode): DataNode | null {
  if (node.type === 'text') {
    return node;
  }

  if (node.children.length === 0) {
    return null;
  }

  if (node.children.length === 1) {
    return canonicalizeNodes(node.children[0]);
  }

  node.children = node.children
    .map((it) => canonicalizeNodes(it))
    .filter((it) => it !== null) as DataNode[];

  return node;
}
