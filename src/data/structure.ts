export interface TextNode {
  type: 'text'
  text: string
  title?: string
  memo?: string
}

export interface ParagraphNode {
  type: 'paragraph'
  children: DataNode[]
  title?: string
  memo?: string
}

interface ConvertionNode {
  type: NodeType
  children?: DataNode[]
  text?: string
  title?: string
  memo?: string
}

function isTextNode(node: ConvertionNode): node is TextNode {
  return node.type === 'text'
}

function isParagraphNode(node: ConvertionNode): node is ParagraphNode {
  return node.type === 'paragraph'
}

export type DataNode = TextNode | ParagraphNode
export type NodeType = DataNode['type']

export function createTextNode(text: string, title?: string, memo?: string): TextNode {
  return {
    type: 'text',
    text,
    title,
    memo,
  }
}

export function createParagraphNode(
  children?: DataNode[],
  title?: string,
  memo?: string,
): ParagraphNode {
  children = children ?? []

  return {
    type: 'paragraph',
    children,
    title,
    memo,
  }
}

export function splitTextNode(node: TextNode, offset: number): [TextNode, TextNode] {
  return [createTextNode(node.text.slice(0, offset)), createTextNode(node.text.slice(offset))]
}

export function insertNewNodeAfterTextNode(
  node: TextNode,
  newNode: DataNode,
  copyInformations?: boolean,
): ParagraphNode {
  const thisNode: ConvertionNode = node as DataNode

  thisNode.type = 'paragraph'
  thisNode.children = [
    copyInformations ? createTextNode(node.text, node.title, node.memo) : createTextNode(node.text),
    newNode,
  ]
  delete thisNode.text

  if (isParagraphNode(thisNode)) {
    return thisNode
  }

  throw new Error('unhandled internal error')
}

export function insertNewNodeBeforeTextNode(
  node: TextNode,
  newNode: DataNode,
  copyInformations?: boolean,
): ParagraphNode {
  const thisNode: ConvertionNode = node as DataNode

  thisNode.type = 'paragraph'
  thisNode.children = [
    newNode,
    copyInformations ? createTextNode(node.text, node.title, node.memo) : createTextNode(node.text),
  ]
  delete thisNode.text

  if (isParagraphNode(thisNode)) {
    return thisNode
  }

  throw new Error('unhandled internal error')
}

export function insertNewNodeToTextNode(
  node: TextNode,
  newNode: DataNode,
  offset: number,
): ParagraphNode {
  const thisNode: ConvertionNode = node as DataNode

  thisNode.type = 'paragraph'
  thisNode.children = [
    createTextNode(node.text.slice(0, offset)),
    newNode,
    createTextNode(node.text.slice(offset)),
  ]
  delete thisNode.text

  if (isParagraphNode(thisNode)) {
    return thisNode
  }

  throw new Error('unhandled internal error')
}

export function insertNewNodeToParagraphNode(
  node: ParagraphNode,
  newNode: DataNode,
  offset: number,
): ParagraphNode {
  node.children = [...node.children.slice(0, offset), newNode, ...node.children.slice(offset)]
  return node
}

export function flattenParagraphNodeAt(node: ParagraphNode, offset: number): ParagraphNode {
  const obj = node.children[offset]

  node.children = [
    ...node.children.slice(0, offset),
    ...(obj.type === 'paragraph' ? obj.children : [obj]),
    ...node.children.slice(offset + 1),
  ]

  return node
}

export function removeNodeAtFromParagraphNode(node: ParagraphNode, offset: number): ParagraphNode {
  if (offset !== 0 && offset !== node.children.length - 1) {
    node.children = [...node.children.slice(0, offset), ...node.children.slice(offset + 1)]
  } else if (offset === 0) {
    node.children = [...node.children.slice(1)]
  } else {
    node.children = [...node.children.slice(0, offset)]
  }

  return node
}

export function removeNodeFromParagraphNode(node: ParagraphNode, target: DataNode): ParagraphNode {
  const index = node.children.indexOf(target)
  if (index === -1) {
    return node
  }

  return removeNodeAtFromParagraphNode(node, index)
}

export function canonicalizeNodes(node: DataNode): DataNode | null {
  if (node.type === 'text') {
    return node
  }

  if (node.children.length === 0) {
    return null
  }

  if (node.children.length === 1) {
    return canonicalizeNodes(node.children[0])
  }

  node.children = node.children
    .map((it) => canonicalizeNodes(it))
    .filter((it) => it !== null) as DataNode[]
  return node
}
