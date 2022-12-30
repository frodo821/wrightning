import { NodeType, DataNode, ConvertionNode, isParagraphNode, isTextNode } from './structure';

export interface DifferenceDesc<T> {
  inserted?: T;
  removed?: T;
}

export interface NodeDifference {
  type?: {
    from: NodeType;
    to: NodeType;
  } | NodeType;
  text?: DifferenceDesc<string>;
  children?: DifferenceDesc<Record<number, NodeDifference>>;
  title?: DifferenceDesc<string>;
  memo?: DifferenceDesc<string>;
}


function createDifferenceFromNode(node: DataNode): NodeDifference {
  const convNode: ConvertionNode = node;

  if (isTextNode(node)) {
    return {
      type: 'text',
      text: {
        inserted: convNode.text,
      },
      title: {
        inserted: convNode.title,
      },
      memo: {
        inserted: convNode.memo,
      },
    };
  }

  if (isParagraphNode(node)) {
    return {
      type: 'paragraph',
      children: {
        inserted: convNode.children?.map(createDifferenceFromNode),
      },
      title: {
        inserted: convNode.title,
      },
      memo: {
        inserted: convNode.memo,
      },
    };
  }

  throw new Error('unhandled internal error');
}

export function equalNode(a: DataNode, b: DataNode): boolean {
  const convA: ConvertionNode = a;
  const convB: ConvertionNode = b;

  if (a.type !== b.type) {
    return false;
  }

  if (isTextNode(a) && isTextNode(b)) {
    return a.text === b.text && a.title === b.title && a.memo === b.memo;
  }

  if (isParagraphNode(a) && isParagraphNode(b)) {
    return a.title === b.title && a.memo === b.memo && a.children.length === b.children.length && a.children.every((it, index) => equalNode(it, b.children[index]));
  }

  throw new Error('unhandled internal error');
}

export function difference(a: DataNode, b: DataNode): NodeDifference | null {
  const convA: ConvertionNode = a;
  const convB: ConvertionNode = b;

  if (isTextNode(a) && isTextNode(b)) {
    if (a.text !== b.text || a.title !== b.title || a.memo !== b.memo) {
      return {
        type: 'text',
        text: a.text !== b.text ? {
          inserted: convB.text,
          removed: convA.text,
        } : undefined,
        title: a.title !== b.title ? {
          inserted: convB.title,
          removed: convA.title,
        } : undefined,
        memo: a.memo !== b.memo ? {
          inserted: convB.memo,
          removed: convA.memo,
        } : undefined,
      };
    }

    return null;
  }

  if (isParagraphNode(a) && isParagraphNode(b)) {
    if (a.title !== b.title || a.memo !== b.memo) {
      return {
        type: 'paragraph',
        title: a.title !== b.title ? {
          inserted: convB.title,
          removed: convA.title,
        } : undefined,
        memo: a.memo !== b.memo ? {
          inserted: convB.memo,
          removed: convA.memo,
        } : undefined,
        children: {
          inserted: convB.children?.map(createDifferenceFromNode),
          removed: convA.children?.map(createDifferenceFromNode),
        },
      };
    }

    if (a.children.length !== b.children.length) {
      return {
        type: 'paragraph',
        children: {
          inserted: convB.children?.map(createDifferenceFromNode),
          removed: convA.children?.map(createDifferenceFromNode),
        },
      };
    }

    const differences = a.children.map((it, index) => difference(it, b.children[index])).filter(it => it !== null);
    if (differences.length === 0) {
      return null;
    }

    return {
      type: 'paragraph',
      children: {
        inserted: convB.children?.map(createDifferenceFromNode),
        removed: convA.children?.map(createDifferenceFromNode),
      },
    };
  }

  return {
    type: {
      from: a.type,
      to: b.type,
    },
    text: {
      inserted: convB.text,
      removed: convA.text,
    },
    children: {
      inserted: convB.children?.map(createDifferenceFromNode),
      removed: convA.children?.map(createDifferenceFromNode),
    },
    title: {
      inserted: convB.title,
      removed: convA.title,
    },
    memo: {
      inserted: convB.memo,
      removed: convA.memo,
    },
  };
}

