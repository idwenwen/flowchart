import { toArray, isArray, remove } from 'lodash'
import { UUID } from '../../uuid/index'
import { each } from './iteration'
import { defNoEnum } from './define'

// 当前树状图对象的唯一标识
const treeId = new UUID((index) => `Tree_${index}`)

// 树结构数据,提供基础树状图内容的遍历, 数据查询等等功能
class Tree {
  // parent: Tree;
  // children: Tree[];
  // _uuid: string;
  // level: number; Tree node level
  constructor (id, parent, children) {
    // 当前属性不可遍历
    defNoEnum(this, {
      _uuid: id || treeId.get(), // 用户可以提供特定的表示内容
      parent: parent || null,
      children: children ? toArray(children) : [],
      level: parent.level ? parent.level + 1 : 1
    })
  }

  setLevel () {
    // 当前层级参数由上一级内容+1获取
    this.level = this._parent ? this._parent.level + 1 : 1

    // 当当前对象的层级修改之后,自己点的层级也应该相应的修改
    if (this._children.length > 0) {
      each(this._children)((tree) => {
        tree.setLevel()
      })
    }
  }

  /** ************************父子节点关系设置 ***********************/
  // 对父节点的设置函数
  set parent (newParent) {
    // 如果当前节点由原父节点内容,原父节点删除当前子节点.
    this._parent && this._parent.remove(this)

    // 新的父节点的内容添加当前子节点
    newParent._children.push(this)

    // 当前子节点设置新的父节点内容
    this._parent = newParent

    // 重新计算当前子节点的层级信息
    this.setLevel()
  }
  get parent () {
    return this._parent
  }

  // 孩子节点设置
  set child (newChild) {
    // 通过当前子节点的父节点设置来达到相关联的目的
    newChild.parent = this
  }
  get child () {
    // 获取最新的新的孩子节点
    return this._children[this._children.length - 1]
  }
  get first () {
    // 获取首个孩子节点
    return this._children[0]
  }

  // 设置新的多个孩子节点
  set children (newChildren) {
    if (isArray(newChildren)) {
      each(newChildren)((val) => {
        val.child = this
      })
    } else {
      this.child = newChildren
    }
  }
  get children () {
    // 查看多有的孩子节点
    return this._children
  }

  remove (child) {
    // 删除当前点子节点内容
    return remove(this._children, (val) => val._uuid === child._uuid)
  }

  /** **********************节点搜索方法**************************/
  // 获取当前节点的祖先节点,
  root (level = 1) {
    let rot = this
    // 由父节点并且父节点的层级大于等于预设层级的话将会进入循环
    while (this.parent && this.parent.level >= level) {
      rot = this.parent
    }
    return rot
  }

  // 节点提升
  upper (upperLevel) {
    let finalLevel
    // 如果需要提升的层级传递小于0则不做任何操作.
    if (upperLevel <= 0) {
      return false
    } else {
      // 如果过当前节点提升过高的话,将会成为根节点,这就会脱离树状图的内容
      // 所以节点最多提升到第二层级节点.
      finalLevel = this.level - upperLevel
      if (finalLevel <= 2) {
        finalLevel = 2
      }
    }
    const parent = this.root(finalLevel - 1)
    this.parent = parent
  }

  // 查询子层级节点内容
  find (down) {
    // 向下层级数内容小于等于0的情况返回自身内容.
    if (down === 0) {
      return [this]
    }
    const finalLevel = this.level + down
    if (finalLevel < this.level) {
      // 如果down为负数表示想上层获取,返回其相关层次的父节点呢日共.
      return [this.root(finalLevel)]
    }
    // 查询相关层级的子孙节点内容.
    const list = []
    for (const val of this.children) {
      list.push(...val.find(down - 1))
    }
    return list
  }

  findChild (opera) {
    let node = opera(this) ? this : null
    if (node) return node
    else {
      for (const val of this.children) {
        node = val.findChild(opera)
        if (node) return node
      }
    }
    return node
  }

  /**
   * 获取当前树状图确定层级的节点
   * @param level
   */
  findByLevel (level) {
    if (level <= 0) return []
    const rot = this.root()
    return rot.find(level - 1)
  }

  // 获取所有的叶子节点
  leaf () {
    // 当前系欸但如果没有子节点,则自身为叶子节点
    if (this.children.length === 0) {
      return [this]
    }
    const leafs = []
    each(this.children)((val) => {
      leafs.push(...val.leaf())
    })
    return leafs
  }

  // 获取当前节点所有的兄弟节点
  brother () {
    const levelNodes = this.findByLevel(this.level)
    return remove(levelNodes, (nodes) => {
      return nodes._uuid === this._uuid
    })
  }

  /** *****************************树状图的常规操作 **********************/
  // 树状图深度遍历 从当前节点开始.
  *deepIterator (reverse = false) {
    if (!reverse) {
      yield this
    }
    if (this._children.length > 0) {
      for (const val of this._children) {
        yield * val.deepIterator()
      }
    }
    if (reverse) {
      yield this
    }
  }

  levelNode (list, upper = false) {
    const nodes = []
    if (!upper) {
      // 获取所有下一层的节点内容.
      each(list)((val) => {
        nodes.push(...val.children)
      })
    } else {
      // 获取所有上一层及的节点.
      each(list)((val) => {
        const pa = val.parent
        if (!nodes.find((item) => pa._uuid === item.uuid)) {
          nodes.push(pa)
        }
      })
    }
    return nodes
  }

  // 广度遍历
  *horizenIterator (reverse = false) {
    let root = [this]
    let next = this.levelNode
    if (reverse) {
      root = this.leaf()
      next = (list) => {
        return this.levelNode(list, true)
      }
    }
    while (
      root.length > 0 ||
      // eslint-disable-next-line no-unmodified-loop-condition
      (reverse && root.length === 1 && root[1]._uuid === this._uuid)
    ) {
      for (const val of root) {
        yield val
      }
      root = next(root)
    }
  }

  // 遍历当前的树状图结构.
  *iteration (deep = true, reverse = false) {
    if (deep) {
      yield * this.deepIterator(reverse)
    } else {
      yield * this.horizenIterator(reverse)
    }
  }

  /**
   * 通知当前树状图之中的节点
   * @param operation
   * @param fromRoot 是否从根节点开始
   * @param deep 是否广度优先
   * @param reserve 是否反向执行
   */
  notify (operation, fromRoot = true, deep = true, reserve = false) {
    const root = fromRoot ? this.root() : this
    const iter = root.iteration(deep, reserve)
    try {
      for (const val of iter) {
        operation.call(val, val)
      }
    } finally {
      void 0
    }
  }
}

export default Tree
