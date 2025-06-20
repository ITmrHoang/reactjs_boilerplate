import { t } from 'i18next';
import i18n from '../i18n';
import { genKey, isEmpty, snakeCaseToTitleCase } from './helper';
import {
  DATA_FLOW_EL_GAP,
  DATA_FLOW_FIELD_LINK_TYPE_WIDTH,
  DATA_FLOW_GROUP_WIDTH,
  DATA_FLOW_NODE_HEIGHT,
  DEFAULT_POSITION,
  FIRST_POSITION_NODE,
  FLOW_HOST_WIDTH,
  FLOW_NODE_HEIGHT,
  GAP_HOST,
  GAP_LINE_Y,
  GAP_NODE_X,
  LINK_TYPE,
  NODE_TYPE,
  PADDING_NODE_WITH_EDGE,
  PREFIX_EDGE,
  PREFIX_FIELD,
  PREFIX_GROUP,
  PREFIX_NODE,
  UNIT_GAP_HOST,
  UNIT_GAP_HOST_Y,
  UNIT_GAP_NODE,
} from './constants';
import { MarkerType, Position } from '@xyflow/react';
const te = (path, prams) =>
  i18n.exists(path)
    ? t(path, prams)
    : snakeCaseToTitleCase(path.split('.').pop());

const nodeTypeObj = {
  [NODE_TYPE.APPLICATION]: te('nodeTypeA'),
  [NODE_TYPE.REPOSITORY]: te('nodeTypeR'),
};

export const NODE_TYPE_OPTION = Object.keys(nodeTypeObj).map(key => ({
  value: key,
  label: nodeTypeObj[key],
}));
export function nodeType(key) {
  return nodeTypeObj[key] || '';
}

const linkerTypeObj = {
  [NODE_TYPE.APPLICATION]: te('linkerTypeA'),
};

export const LINKER_TYPE_OPTION = Object.keys(linkerTypeObj).map(key => ({
  value: key,
  label: linkerTypeObj[key],
}));
export function linkerType(key) {
  return linkerTypeObj[key] || '';
}

const linkTypeObj = {
  [LINK_TYPE.DATABASE_SELECT]: te('data_select'),
  [LINK_TYPE.DATABASE_INSERT]: te('data_insert'),
  [LINK_TYPE.DATABASE_UPDATE]: te('data_update'),
  [LINK_TYPE.DATABASE_DELETE]: te('data_delete'),
  [LINK_TYPE.FILE_READ]: te('file_read'),
  [LINK_TYPE.FILE_WRITE]: te('file_write'),
  [LINK_TYPE.REQUEST]: te('request'),
};

export const linkTypeColor = {
  [LINK_TYPE.DATABASE_SELECT]: '#007ACC',
  [LINK_TYPE.DATABASE_INSERT]: '#00CC66',
  [LINK_TYPE.DATABASE_UPDATE]: '#FF9900',
  [LINK_TYPE.DATABASE_DELETE]: '#CC0000',
  [LINK_TYPE.FILE_READ]: '#00BFFF',
  [LINK_TYPE.FILE_WRITE]: '#FF6347',
  [LINK_TYPE.REQUEST]: '#0099CC',
  undefined: 'transparent',
};

export const LINK_TYPE_OPTION = Object.keys(linkTypeObj).map(key => ({
  value: key,
  label: `${key}, ${linkTypeObj[key]}`,
}));
export function linkType(key) {
  return linkTypeObj[key] || '';
}

const defaultHost = {
  nodes: [],
  nodesId: new Map(),
  positionNode: structuredClone(DEFAULT_POSITION),
  host: {},
};

const handleGeneration = () => {
  const position_host = { ...DEFAULT_POSITION };
  const hosts = {};
  const _node_list = {};
  const handleIndex = {};
  const maxSourceOfIndexInGroup = {};
  const nodes = [];
  const edges = [];
  let lastIndex = { value: 0 };
  const getHost = id => {
    if (hosts[id]) {
      return { check: true, host: hosts[id] };
    } else {
      hosts[id] = structuredClone(defaultHost);
      return { check: false, host: hosts[id] };
    }
  };

  const addNode = (flowData, prefix = 'from') => {
    if (flowData[`${prefix}NodeId`]) {
      const { check, host } = getHost(flowData[`${prefix}HostId`]);
      // add node groups
      if (!check) {
        const _host_info = {
          id: `${PREFIX_GROUP}-${flowData[`${prefix}HostId`]}`,
          position: { ...position_host },
          type: PREFIX_GROUP,
          // dragHandle: '.drag_handle__custom',
          draggable: false,
          selectable: false,
          style: {
            width: FLOW_HOST_WIDTH,
            height: FIRST_POSITION_NODE,
          },
          data: {
            id: flowData[`${prefix}HostId`],
            label: flowData[`${prefix}HostName`],
          },
        };
        position_host.x += GAP_HOST;
        host.host = _host_info;
        nodes.push(_host_info);
      }
      // add nodes children
      if (!host.nodesId.has(flowData[`${prefix}NodeId`])) {
        const indexIngroup = host.nodesId.size;
        const _node = {
          id: `${PREFIX_NODE}-${flowData[`${prefix}NodeId`]}`,
          position: { ...host.positionNode },
          type: PREFIX_NODE,
          parentId: host.host.id,
          extent: 'parent',
          dragHandle: '.drag_handle__custom',
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: {
            indexInGroup: indexIngroup,
            nodeId: flowData[`${prefix}NodeId`],
            nodeType: flowData[`${prefix}NodeType`],
            schemeName: flowData[`${prefix}SchemeName`],
            hostName: flowData[`${prefix}HostName`],
            portNo: flowData[`${prefix}PortNo`],
            pathString: flowData[`${prefix}PathString`],
          },
        };
        // create ref maxSource in Groups
        !maxSourceOfIndexInGroup[indexIngroup] &&
          (maxSourceOfIndexInGroup[indexIngroup] = {
            index: indexIngroup,
            value: 0,
          });

        host.nodes.push(_node);
        host.nodesId.set(flowData[`${prefix}NodeId`]);
        nodes.push(_node);
        _node_list[`node-${flowData[`${prefix}NodeId`]}`] = _node;
      }
    }
  };

  const getHandleIndex = id => {
    if (!handleIndex[id]) {
      const nodeObj = _node_list[`${PREFIX_NODE}-${id}`];
      const maxSourceObj = maxSourceOfIndexInGroup[nodeObj.data.indexInGroup];
      const _handleIndex = {
        sourceIndex: 0,
        targetIndex: 0,
        total: {
          source: 0,
          target: 0,
        },
        maxSourceIndex: maxSourceObj,
      };
      handleIndex[id] = _handleIndex;
    }
    return handleIndex[id];
  };

  const addHandleSource = id => {
    const _handle = getHandleIndex(id);
    const nodeObj = _node_list[`${PREFIX_NODE}-${id}`];
    const maxSourceObj = maxSourceOfIndexInGroup[nodeObj.data.indexInGroup];
    const result = { ..._handle };
    _handle.sourceIndex++;
    const total = ++_handle.total.source;
    if (total > maxSourceObj.value) {
      maxSourceObj.value = total;
    }

    return result;
  };

  const addHandleTarget = id => {
    const _handle = getHandleIndex(id);
    const result = { ..._handle };
    _handle.targetIndex++;
    _handle.total.target++;
    return result;
  };

  const addEdge = flowData => {
    if (flowData.thisNodeId && flowData.fromNodeId && flowData.linkType) {
      const _handleSourceIndex = { ...getHandleIndex(flowData.fromNodeId) };
      const _handleTargetIndex = { ...getHandleIndex(flowData.thisNodeId) };
      addHandleSource(flowData.fromNodeId);
      addHandleTarget(flowData.thisNodeId);
      const _edge = {
        id: `${PREFIX_EDGE}-${flowData.flowId}__${PREFIX_NODE}-${flowData.fromNodeId}__${PREFIX_NODE}-${flowData.thisNodeId}`,
        source: `${PREFIX_NODE}-${flowData.fromNodeId}`,
        type: PREFIX_EDGE,
        target: `${PREFIX_NODE}-${flowData.thisNodeId}`,
        data: {
          ...flowData,
          color: linkTypeColor[flowData.linkType],
          index: lastIndex.value++,
          handleSourceIndex: _handleSourceIndex,
          handleTargetIndex: _handleTargetIndex,
          lastIndex,
        },
        // animated: true,
        markerEnd: {
          type: MarkerType.Arrow,
          color: linkTypeColor[flowData.linkType],
        },
      };
      const _from_node = _node_list[`node-${flowData.fromNodeId}`];
      _from_node.data.source = true;
      const _this_node = _node_list[`node-${flowData.thisNodeId}`];
      _this_node.data.target = true;
      edges.push(_edge);
    }
  };
  const addFlow = flow => {
    addNode(flow, 'from');
    addNode(flow, 'this');
    addEdge(flow);
  };

  const elAllocation = () => {
    for (const value of Object.values(hosts)) {
      let _height = 30;
      const _nodes = value.nodes;
      for (const _node of Object.values(_nodes)) {
        const _handleIndex = structuredClone(getHandleIndex(_node.data.nodeId));
        _node.position.y = _height;
        _height =
          _height +
          _handleIndex.maxSourceIndex.value * GAP_LINE_Y +
          FLOW_NODE_HEIGHT +
          PADDING_NODE_WITH_EDGE * 2;
      }
      value.host.style.height = _height;
    }
  };
  return { addFlow, hosts, nodes, edges, elAllocation };
};

export const globalHandleIndexOfNode = {};
export function getHandleIndexNodeId(id) {
  return globalHandleIndexOfNode[id]
    ? globalHandleIndexOfNode[id]
    : (globalHandleIndexOfNode[id] = { up: 0, down: 0 });
}

export function upHandleIndexNodeId(id) {
  const _handle = getHandleIndexNodeId(id);
  return _handle.up++;
}

export function flowsToDataDiagrams(flows) {
  const _flows = flows.sort((a, b) => a.pipelineSequence - b.pipelineSequence);
  const len_flows = flows.length;
  const { addFlow, nodes, edges, elAllocation } = handleGeneration();
  for (let i = 0; i < len_flows; i++) {
    const _flow = _flows[i];
    addFlow(_flow);
  }
  elAllocation();
  return { edges, nodes };
}

const handleGeneration2 = () => {
  const position_host = { ...DEFAULT_POSITION };
  const _node_list = [];
  const nodes = [];
  const edges = [];
  let preNode = null;
  let count = 0;

  const addNode = flow => {
    if (flow.fromHostName === flow.thisHostName && flow.thisHostName) {
      count += 2;
      const _key = genKey();
      const host_node = {
        id: `${PREFIX_GROUP}-${_key}`,
        position: { ...position_host },
        type: PREFIX_GROUP,
        // dragHandle: '.drag_handle__custom',
        draggable: true,
        selectable: false,
        style: {
          width: 200 + DEFAULT_POSITION.x + GAP_NODE_X,
          height:
            FIRST_POSITION_NODE + FLOW_NODE_HEIGHT + PADDING_NODE_WITH_EDGE,
        },
        data: {
          label: flow.thisHostName,
        },
      };
      position_host.x += 200 + DEFAULT_POSITION.x + GAP_NODE_X + UNIT_GAP_HOST;
      nodes.push(host_node);
      const formNode = {
        id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}`,
        position: { x: DEFAULT_POSITION.x, y: DEFAULT_POSITION.y },
        type: PREFIX_NODE,
        parentId: `${PREFIX_GROUP}-${_key}`,
        extent: 'parent',
        dragHandle: '.drag_handle__custom',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}`,
          nodeId: `${flow[`fromNodeId`]} Flow(${flow?.pipelineSequence})`,
          nodeType: flow[`fromNodeType`],
          schemeName: flow[`fromSchemeName`],
          hostName: flow[`fromHostName`],
          portNo: flow[`fromPortNo`],
          pathString: flow[`fromPathString`],
          preNode: { ...preNode },
          target: preNode?.id ? true : false,
          source: true,
        },
      };
      preNode = { id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}` };

      nodes.push(formNode);

      const thisNode = {
        id: `${PREFIX_NODE}-${_key}-${flow.thisNodeId}`,
        position: {
          x: DEFAULT_POSITION.x + UNIT_GAP_NODE + 200,
          y: DEFAULT_POSITION.y,
        },
        type: PREFIX_NODE,
        parentId: `${PREFIX_GROUP}-${_key}`,
        extent: 'parent',
        dragHandle: '.drag_handle__custom',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          id: `${PREFIX_NODE}-${_key}-${flow.thisNodeId}`,
          nodeId: `${flow[`thisNodeId`]} Flow(${flow?.pipelineSequence})`,
          nodeType: flow[`thisNodeType`],
          schemeName: flow[`thisSchemeName`],
          hostName: flow[`thisHostName`],
          portNo: flow[`thisPortNo`],
          pathString: flow[`thisPathString`],
          preNode: { ...preNode, linkType: flow.linkType },
          target: preNode?.id ? true : false,
          source: true,
        },
      };
      preNode = { id: `${PREFIX_NODE}-${_key}-${flow.thisNodeId}` };
      nodes.push(thisNode);
      _node_list.push(formNode, thisNode);
    } else if (flow.fromHostName && flow.thisHostName) {
      count += 2;
      const _key = genKey();
      const from__host_node = {
        id: `${PREFIX_GROUP}-from-${_key}`,
        position: { ...position_host },
        type: PREFIX_GROUP,
        // dragHandle: '.drag_handle__custom',
        draggable: true,
        selectable: false,
        style: {
          width: FLOW_HOST_WIDTH,
          height:
            FIRST_POSITION_NODE + FLOW_NODE_HEIGHT + PADDING_NODE_WITH_EDGE,
        },
        data: {
          label: flow.fromHostName,
        },
      };
      position_host.x += FLOW_HOST_WIDTH + UNIT_GAP_HOST;
      nodes.push(from__host_node);
      const formNode = {
        id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}`,
        position: { x: DEFAULT_POSITION.x, y: DEFAULT_POSITION.y },
        type: PREFIX_NODE,
        parentId: `${PREFIX_GROUP}-from-${_key}`,
        extent: 'parent',
        dragHandle: '.drag_handle__custom',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}`,
          nodeId: `${flow[`fromNodeId`]} Flow(${flow?.pipelineSequence})`,
          nodeType: flow[`fromNodeType`],
          schemeName: flow[`fromSchemeName`],
          hostName: flow[`fromHostName`],
          portNo: flow[`fromPortNo`],
          pathString: flow[`fromPathString`],
          preNode: { ...preNode },
          target: preNode?.id ? true : false,
          source: true,
        },
      };
      preNode = { id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}` };

      nodes.push(formNode);
      const this__host_node = {
        id: `${PREFIX_GROUP}-this-${_key}`,
        position: { ...position_host },
        type: PREFIX_GROUP,
        // dragHandle: '.drag_handle__custom',
        draggable: true,
        selectable: false,
        style: {
          width: FLOW_HOST_WIDTH,
          height:
            FIRST_POSITION_NODE + FLOW_NODE_HEIGHT + PADDING_NODE_WITH_EDGE,
        },
        data: {
          label: flow.thisHostName,
        },
      };
      position_host.x += FLOW_HOST_WIDTH + UNIT_GAP_HOST;
      nodes.push(this__host_node);

      const thisNode = {
        id: `${PREFIX_NODE}-${_key}-${flow.thisNodeId}`,
        position: {
          x: DEFAULT_POSITION.x,
          y: DEFAULT_POSITION.y,
        },
        type: PREFIX_NODE,
        parentId: `${PREFIX_GROUP}-this-${_key}`,
        extent: 'parent',
        dragHandle: '.drag_handle__custom',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          id: `${PREFIX_NODE}-${_key}-${flow.thisNodeId}`,
          nodeId: `${flow[`thisNodeId`]} Flow(${flow?.pipelineSequence})`,
          nodeType: flow[`thisNodeType`],
          schemeName: flow[`thisSchemeName`],
          hostName: flow[`thisHostName`],
          portNo: flow[`thisPortNo`],
          pathString: flow[`thisPathString`],
          preNode: { ...preNode, linkType: flow.linkType },
          target: preNode?.id ? true : false,
          source: true,
        },
      };
      preNode = { id: `${PREFIX_NODE}-${_key}-${flow.thisNodeId}` };
      nodes.push(thisNode);
      _node_list.push(formNode, thisNode);
    } else if (flow.fromHostName) {
      count += 1;
      const _key = genKey();
      const host_node = {
        id: `${PREFIX_GROUP}-${_key}`,
        position: { ...position_host },
        type: PREFIX_GROUP,
        // dragHandle: '.drag_handle__custom',
        draggable: true,
        selectable: false,
        style: {
          width: FLOW_HOST_WIDTH,
          height:
            FIRST_POSITION_NODE + FLOW_NODE_HEIGHT + PADDING_NODE_WITH_EDGE,
        },
        data: {
          label: flow.fromHostName,
        },
      };
      position_host.x += FLOW_HOST_WIDTH + UNIT_GAP_HOST;
      nodes.push(host_node);
      const formNode = {
        id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}`,
        position: { x: DEFAULT_POSITION.x, y: DEFAULT_POSITION.y },
        type: PREFIX_NODE,
        parentId: `${PREFIX_GROUP}-${_key}`,
        extent: 'parent',
        dragHandle: '.drag_handle__custom',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}`,
          nodeId: `${flow[`fromNodeId`]} Flow(${flow?.pipelineSequence})`,
          nodeType: flow[`fromNodeType`],
          schemeName: flow[`fromSchemeName`],
          hostName: flow[`fromHostName`],
          portNo: flow[`fromPortNo`],
          pathString: flow[`fromPathString`],
          preNode: { ...preNode },
          target: preNode?.id ? true : false,
          source: true,
        },
      };
      preNode = { id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}` };
      nodes.push(formNode);
      _node_list.push(formNode);
    } else if (flow.thisHostName) {
      count += 1;
      const _key = genKey();
      const host_node = {
        id: `${PREFIX_GROUP}-${_key}`,
        position: { ...position_host },
        type: PREFIX_GROUP,
        // dragHandle: '.drag_handle__custom',
        draggable: true,
        selectable: false,
        style: {
          width: FLOW_HOST_WIDTH,
          height:
            FIRST_POSITION_NODE + FLOW_NODE_HEIGHT + PADDING_NODE_WITH_EDGE,
        },
        data: {
          label: flow.thisHostName,
        },
      };
      position_host.x += FLOW_HOST_WIDTH + UNIT_GAP_HOST;
      nodes.push(host_node);
      const thisNode = {
        id: `${PREFIX_NODE}-${_key}-${flow.thisNodeId}`,
        position: { x: DEFAULT_POSITION.x, y: DEFAULT_POSITION.y },
        type: PREFIX_NODE,
        parentId: `${PREFIX_GROUP}-${_key}`,
        extent: 'parent',
        dragHandle: '.drag_handle__custom',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          id: `${PREFIX_NODE}-${_key}-${flow.thisNodeId}`,
          nodeId: `${flow[`thisNodeId`]} Flow(${flow?.pipelineSequence})`,
          nodeType: flow[`thisNodeType`],
          schemeName: flow[`thisSchemeName`],
          hostName: flow[`thisHostName`],
          portNo: flow[`thisPortNo`],
          pathString: flow[`thisPathString`],
          preNode: { ...preNode },
          target: preNode?.id ? true : false,
          source: true,
        },
      };
      preNode = { id: `${PREFIX_NODE}-${_key}-${flow.thisNodeId}` };
      nodes.push(thisNode);
      _node_list.push(thisNode);
    }

    if (count >= 10) {
      position_host.x = DEFAULT_POSITION.x;
      position_host.y +=
        UNIT_GAP_HOST_Y +
        FIRST_POSITION_NODE +
        FLOW_NODE_HEIGHT +
        PADDING_NODE_WITH_EDGE;
      count = 0;
    }
  };

  const addFlow = flow => {
    addNode(flow);
  };

  const genEdge = () => {
    const lenNode = _node_list.length;
    for (let i = 0; i < lenNode; i++) {
      const _node = _node_list[i];
      const sourceId = _node.data.preNode?.id;
      if (sourceId) {
        const _edge = {
          id: `${PREFIX_EDGE}-${sourceId}__${_node.data.id}`,
          source: sourceId,
          type: 'smoothstep',
          target: `${_node.data.id}`,
          animated: true,
          label: linkType(_node.data.preNode?.linkType),
          labelStyle: {
            transform: 'translateX(1px)',
            stroke: linkTypeColor[_node.data.preNode?.linkType] || 'gray',
            strokeWidth: '0.5px',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: linkTypeColor[_node.data.preNode?.linkType] || 'gray',
          },
          style: {
            stroke: linkTypeColor[_node.data.preNode?.linkType] || 'gray',
          },
        };
        edges.push(_edge);
      }
    }
  };
  return { addFlow, genEdge, nodes, edges };
};

export function flowsToDataDiagrams2(flows) {
  const _flows = flows.sort((a, b) => a.pipelineSequence - b.pipelineSequence);
  const len_flows = flows.length;
  const { addFlow, genEdge, nodes, edges } = handleGeneration2();
  for (let i = 0; i < len_flows; i++) {
    const _flow = _flows[i];
    addFlow(_flow);
  }
  genEdge(0);
  return { edges, nodes };
}

export function flowsDataDiagrams(flows) {
  const _flows = flows.sort((a, b) => a.pipelineSequence - b.pipelineSequence);
  const len_flows = flows.length;
  const { nodes, edges } = handleGenerationDataFlow(_flows, len_flows);
  return { edges, nodes };
}

const handleGenerationDataFlow = (flows, len) => {
  const _node_list = [];
  const nodeFieldFromNode = {
    id: `${PREFIX_FIELD}-from`,
    position: { x: 0, y: 0 },
    style: {
      width: DATA_FLOW_GROUP_WIDTH + 2 * DATA_FLOW_EL_GAP,
      height: 0,
    },
    data: { label: te('from_node') },
    className: 'from-node',
    type: PREFIX_FIELD,
    draggable: false,
    selectable: false,
  };
  const nodeFieldFromLinkType = {
    id: `${PREFIX_FIELD}-from-link-type`,
    position: { x: 1 * (DATA_FLOW_GROUP_WIDTH + 2 * DATA_FLOW_EL_GAP), y: 0 },
    style: {
      width: DATA_FLOW_FIELD_LINK_TYPE_WIDTH,
      height: 100,
    },
    type: PREFIX_FIELD,
    data: { label: te('from_link_type') },
    draggable: false,
    selectable: false,
  };
  const nodeFieldLinker = {
    id: `${PREFIX_FIELD}-linker`,
    position: {
      x:
        1 * (DATA_FLOW_GROUP_WIDTH + 2 * DATA_FLOW_EL_GAP) +
        1 * DATA_FLOW_FIELD_LINK_TYPE_WIDTH,
      y: 0,
    },
    data: { label: te('linker') },
    style: {
      width: DATA_FLOW_GROUP_WIDTH + 2 * DATA_FLOW_EL_GAP,
      height: 100,
    },
    type: PREFIX_FIELD,
    draggable: false,
    selectable: false,
  };
  const nodeFieldToLinkType = {
    id: `${PREFIX_FIELD}-to-link-type`,
    position: {
      x:
        2 * (DATA_FLOW_GROUP_WIDTH + 2 * DATA_FLOW_EL_GAP) +
        1 * DATA_FLOW_FIELD_LINK_TYPE_WIDTH,
      y: 0,
    },
    data: { label: te('to_link_type') },
    style: {
      width: DATA_FLOW_FIELD_LINK_TYPE_WIDTH,
      height: 100,
    },
    type: PREFIX_FIELD,
    draggable: false,
    selectable: false,
  };
  const nodeFieldToNode = {
    id: `${PREFIX_FIELD}-to-node`,
    data: { label: te('to_node') },
    position: {
      x:
        2 * (DATA_FLOW_GROUP_WIDTH + 2 * DATA_FLOW_EL_GAP) +
        2 * DATA_FLOW_FIELD_LINK_TYPE_WIDTH,
      y: 0,
    },
    style: {
      width: DATA_FLOW_GROUP_WIDTH + 2 * DATA_FLOW_EL_GAP,
      height: 100,
    },
    type: PREFIX_FIELD,
    draggable: false,
    selectable: false,
  };
  const nodes = [
    nodeFieldFromNode,
    nodeFieldFromLinkType,
    nodeFieldLinker,
    nodeFieldToLinkType,
    nodeFieldToNode,
  ];
  const edges = [];

  const preHost = {
    from: {
      start: DATA_FLOW_EL_GAP,
      end: 0,
      nextY: DATA_FLOW_EL_GAP,
      preEndWithHeight: 0,
      height: 0,
      positionNodeY: DATA_FLOW_EL_GAP,
      nodeIds: new Set(),
      nodeEntity: {},
      data: null,
    },
    linker: {
      start: DATA_FLOW_EL_GAP,
      end: 0,
      preEndWithHeight: 0,
      nextY: DATA_FLOW_EL_GAP,
      height: 0,
      positionNodeY: DATA_FLOW_EL_GAP,
      nodeIds: new Set(),
      nodeEntity: {},
      data: null,
    },
    to: {
      start: DATA_FLOW_EL_GAP,
      end: 0,
      nextY: DATA_FLOW_EL_GAP,
      height: 0,
      nodeIds: new Set(),
      positionNodeY: DATA_FLOW_EL_GAP,
      nodeEntity: {},
      data: null,
    },
  };

  const clearFromHost = () => {
    preHost.from.data = null;
    preHost.from.nodeIds.clear();
    preHost.from.nodeEntity = {};
    preHost.from.positionNodeY = DATA_FLOW_EL_GAP;
  };
  const clearLinkerHost = () => {
    preHost.linker.data = null;
    preHost.linker.nodeIds.clear();
    preHost.linker.nodeEntity = {};
    preHost.linker.positionNodeY = DATA_FLOW_EL_GAP;
  };

  const clearToHost = () => {
    preHost.to.data = null;
    preHost.to.nodeIds.clear();
    preHost.to.nodeEntity = {};
    preHost.to.positionNodeY = DATA_FLOW_EL_GAP;
  };

  const setNextYFrom = height => {
    let _nextY = preHost.from.start + height + DATA_FLOW_EL_GAP;
    preHost.from.nextY = _nextY;
  };

  const getYLinker = fromHostChange => {
    if (
      fromHostChange &&
      preHost.from.preEndWithHeight > preHost.linker.start
    ) {
      preHost.linker.start = Math.max(
        preHost.from.preEndWithHeight + DATA_FLOW_EL_GAP,
        preHost.linker.nextY,
      );
      preHost.linker.nextY = Math.max(
        preHost.from.preEndWithHeight + DATA_FLOW_EL_GAP,
        preHost.linker.nextY,
      );
    }
    return preHost.linker.nextY;
  };
  const setNextYLinker = height => {
    let _nextY = preHost.linker.start + height + DATA_FLOW_EL_GAP;
    preHost.linker.nextY = _nextY;
    if (_nextY > preHost.from.nextY) {
      preHost.from.nextY = _nextY;
    }
  };

  const getYTo = fromLinkerChange => {
    if (fromLinkerChange) {
      let positionY = Math.max(
        preHost.linker.preEndWithHeight + DATA_FLOW_EL_GAP,
        preHost.to.nextY,
        preHost.linker.start,
      );
      preHost.to.start = positionY;
      preHost.to.nextY = positionY;
    }
    return preHost.to.nextY;
  };
  const setNextYTo = height => {
    let _nextY = preHost.to.start + height + DATA_FLOW_EL_GAP;
    preHost.to.nextY = _nextY;
    if (_nextY > preHost.linker.nextY) {
      preHost.linker.nextY = _nextY;
    }

    if (_nextY > preHost.from.nextY) {
      preHost.from.nextY = _nextY;
    }
  };

  const calculationHeight = () => {
    let height = Math.max(
      preHost.from.nextY,
      preHost.linker.nextY,
      preHost.to.nextY,
    );
    // set height for  col field
    nodeFieldFromNode.style.height = height;
    nodeFieldLinker.style.height = height;
    nodeFieldToNode.style.height = height;
  };
  let _fromHostChange = false;
  const handleFrom = flow => {
    // create host
    if (flow?.fromHostId != preHost.from.data?.data?.fromHostId) {
      _fromHostChange = true;
      if (flow?.fromHostId) {
        const _key = genKey();
        const from__host = {
          id: `${PREFIX_GROUP}-from-${_key}`,
          position: { x: DATA_FLOW_EL_GAP, y: preHost.from.nextY },
          type: PREFIX_GROUP,
          parentId: nodeFieldFromNode.id,
          extent: 'parent',
          // dragHandle: '.drag_handle__custom',
          draggable: true,
          selectable: false,
          style: {
            width: DATA_FLOW_GROUP_WIDTH,
            height: 0,
          },
          data: {
            fromHostId: flow.fromHostId,
            classNames: 'data-flow-group',
            label: flow.fromHostName,
            start: preHost.from.nextY,
          },
        };
        clearFromHost();
        _node_list.push(from__host);
        nodes.push(from__host);
        preHost.from.data = {
          id: `${PREFIX_GROUP}-from-${_key}`,
          ...from__host,
        };
        // recalculation position
        //when change from host set new start
      } else {
        // when from node is empty
        clearFromHost();
      }
      preHost.from.start = preHost.from.nextY;
    }

    // create node if node in host and not created yet
    if (
      !isEmpty(flow?.fromHostId) &&
      !preHost.from.nodeIds.has(flow.fromNodeId)
    ) {
      const _key = genKey();
      let len_last_node = preHost.from.nodeIds.size;
      let positionY =
        preHost.from.positionNodeY +
        (len_last_node * DATA_FLOW_NODE_HEIGHT +
          DATA_FLOW_EL_GAP * len_last_node);
      const fromNode = {
        id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}`,
        position: { x: DEFAULT_POSITION.x, y: positionY },
        type: PREFIX_NODE,
        parentId: preHost.from.data.id,
        extent: 'parent',
        dragHandle: '.drag_handle__custom',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          classNames: 'data-flow-from',
          id: `${PREFIX_NODE}-${_key}-${flow.fromNodeId}`,
          nodeId: `${flow[`fromNodeId`]}`,
          nodeType: flow[`fromNodeType`],
          schemeName: flow[`fromSchemeName`],
          hostName: flow[`fromHostName`],
          portNo: flow[`fromPortNo`],
          pathString: flow[`fromPathString`],
          source: true,
          type: 'NODE',
        },
      };
      nodes.push(fromNode);
      preHost.from.nodeIds.add(flow.fromNodeId);
      preHost.from.nodeEntity[flow.fromNodeId] = fromNode;
      let len_node_in_host = preHost.from.nodeIds.size;
      let _height =
        len_node_in_host * DATA_FLOW_NODE_HEIGHT +
        DATA_FLOW_EL_GAP * (len_node_in_host + 1);
      preHost.from.data.style.height = _height;
      preHost.from.height = _height;
      !_fromHostChange &&
        (preHost.from.preEndWithHeight = preHost.from.start + _height);

      // process recalculate  position
      setNextYFrom(preHost.from.data.style.height);
    }
  };

  let _linkerHostChange = false;
  const handleLinker = flow => {
    let _preFromHostChange = _fromHostChange;
    let _nextY = getYLinker(_preFromHostChange);
    preHost.linker.data &&
      (preHost.linker.data.data.end = _nextY - DATA_FLOW_EL_GAP);
    // create host
    if (flow.linkerHostId != preHost.linker.data?.data?.linkerHostId) {
      _linkerHostChange = true;
      _fromHostChange = false;
      const _key = genKey();
      const linker__host = {
        id: `${PREFIX_GROUP}-linker-${_key}`,
        position: { x: DATA_FLOW_EL_GAP, y: _nextY },
        type: PREFIX_GROUP,
        parentId: nodeFieldLinker.id,
        extent: 'parent',
        // dragHandle: '.drag_handle__custom',
        draggable: true,
        selectable: false,
        style: {
          width: DATA_FLOW_GROUP_WIDTH,
          height: 100,
        },
        data: {
          linkerHostId: flow.linkerHostId,
          classNames: 'data-flow-group',
          label: flow.linkerHostName,
          start: _nextY,
        },
      };

      clearLinkerHost();
      _node_list.push(linker__host);
      nodes.push(linker__host);
      preHost.linker.data = {
        id: `${PREFIX_GROUP}-linker-${_key}`,
        ...linker__host,
      };
      // recalculation position
      //when change to host set new start
      preHost.linker.start = preHost.linker.nextY;
    }
    // create node if not in preHost linker yet
    if (!preHost.linker.nodeIds.has(flow.linkerId)) {
      const _key = genKey();
      let len_last_node = preHost.linker.nodeIds.size;
      let positionY =
        preHost.linker.positionNodeY +
        (len_last_node * DATA_FLOW_NODE_HEIGHT +
          DATA_FLOW_EL_GAP * len_last_node);
      const linkerNode = {
        id: `${PREFIX_NODE}-${_key}-${flow.linkerId}`,
        position: { x: DEFAULT_POSITION.x, y: positionY },
        type: PREFIX_NODE,
        parentId: preHost.linker.data.id,
        extent: 'parent',
        dragHandle: '.drag_handle__custom',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          classNames: 'data-flow-linker',
          id: `${PREFIX_NODE}-${_key}-${flow.linkerId}`,
          nodeId: `${flow[`linkerId`]}`,
          nodeType: flow[`linkerType`],
          schemeName: flow[`linkerSchemeName`],
          hostName: flow[`linkerHostName`],
          portNo: flow[`linkerPortNo`],
          pathString: flow[`linkerPathString`],
          type: 'LINKER',
        },
      };
      nodes.push(linkerNode);
      preHost.linker.nodeIds.add(flow.linkerId);
      preHost.linker.nodeEntity[flow.linkerId] = linkerNode;
      let len_node_in_host = preHost.linker.nodeIds.size;
      let _height =
        len_node_in_host * DATA_FLOW_NODE_HEIGHT +
        DATA_FLOW_EL_GAP * (len_node_in_host + 1);
      preHost.linker.data.style.height = _height;
      preHost.linker.height = _height;

      preHost.from.data &&
        (preHost.from.data.data.end =
          preHost.linker.start + _height - DATA_FLOW_EL_GAP);

      !_linkerHostChange &&
        (preHost.linker.preEndWithHeight = preHost.linker.start + _height);
      // process recalculate  position
      setNextYLinker(preHost.linker.data.style.height);
    }
  };
  const handleTo = flow => {
    // create host
    let _preLinkerHostChange = _linkerHostChange;
    if (flow.toHostId != preHost.to.data?.data?.toHostId) {
      _linkerHostChange = false;
      let _nextY = getYTo(_preLinkerHostChange);
      preHost.to.data && (preHost.to.data.data.end = _nextY - DATA_FLOW_EL_GAP);
      if (flow.toHostId) {
        const _key = genKey();
        const to__host = {
          id: `${PREFIX_GROUP}-to-${_key}`,
          position: { x: DATA_FLOW_EL_GAP, y: _nextY },
          type: PREFIX_GROUP,
          parentId: nodeFieldToNode.id,
          extent: 'parent',
          // dragHandle: '.drag_handle__custom',
          draggable: true,
          selectable: false,
          style: {
            width: DATA_FLOW_GROUP_WIDTH,
            height: 0,
          },
          data: {
            toHostId: flow.toHostId,
            classNames: 'data-flow-group',
            label: flow.toHostName,
            start: _nextY,
          },
        };

        clearToHost();
        _node_list.push(to__host);
        nodes.push(to__host);
        preHost.to.data = {
          id: `${PREFIX_GROUP}-to-${_key}`,
          ...to__host,
        };
        // recalculation position
        //when change to host set new start
        preHost.to.start = preHost.to.nextY;
      } else {
        clearToHost();
      }
    }
    // create node if not in preHost to yet
    if (!preHost.to.nodeIds.has(flow.toNodeId) && flow.toNodeId) {
      const _key = genKey();
      let len_last_node = preHost.to.nodeIds.size;
      let positionY =
        preHost.to.positionNodeY +
        (len_last_node * DATA_FLOW_NODE_HEIGHT +
          DATA_FLOW_EL_GAP * len_last_node);

      const toNode = {
        id: `${PREFIX_NODE}-${_key}-${flow.toNodeId}`,
        position: { x: DEFAULT_POSITION.x, y: positionY },
        type: PREFIX_NODE,
        parentId: preHost.to.data.id,
        extent: 'parent',
        dragHandle: '.drag_handle__custom',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          classNames: 'data-flow-to',
          id: `${PREFIX_NODE}-${_key}-${flow.toNodeId}`,
          nodeId: `${flow[`toNodeId`]}`,
          nodeType: flow[`toNodeType`],
          schemeName: flow[`toSchemeName`],
          hostName: flow[`toHostName`],
          portNo: flow[`toPortNo`],
          pathString: flow[`toPathString`],
          target: true,
          type: 'NODE',
        },
      };
      nodes.push(toNode);
      preHost.to.nodeIds.add(flow.toNodeId);
      preHost.to.nodeEntity[flow.toNodeId] = toNode;
      let len_node_in_host = preHost.to.nodeIds.size;
      let _height =
        len_node_in_host * DATA_FLOW_NODE_HEIGHT +
        DATA_FLOW_EL_GAP * (len_node_in_host + 1);
      preHost.to.data.style.height = _height;
      preHost.to.height = _height;

      preHost.linker.data &&
        (preHost.linker.data.data.end =
          preHost.to.start + _height - DATA_FLOW_EL_GAP);
      preHost.from.data &&
        (preHost.from.data.data.end = Math.max(
          preHost.from.data.data.end,
          preHost.to.start + _height - DATA_FLOW_EL_GAP,
        ));
      // process recalculate  position
      setNextYTo(preHost.to.data.style.height);
    }
  };
  const countLine = {};
  const genEdge = flow => {
    function createEdge(source, target, type) {
      function getTotal() {
        return countLine[`${source}_${target}`].count;
      }
      !countLine[`${source}_${target}`] &&
        (countLine[`${source}_${target}`] = {});
      const item = countLine[`${source}_${target}`];
      item.listType ? item.listType : (item.listType = new Set());
      const setListType = item.listType;
      if (!setListType.has(type)) {
        item.listType.add(type);
        let _count = item.count ? ++item.count : 1;
        item.count = _count;

        let _key = genKey();
        const _edge = {
          id: `${PREFIX_EDGE}-${_key}_source_${source}_target_${target}`,
          source: source,
          type: PREFIX_EDGE,
          target: `${target}`,
          animated: true,
          label: linkType(type),
          data: {
            number: _count,
            total: getTotal,
            type: type,
            color:
              (linkTypeColor[type] != linkTypeColor.undefined &&
                linkTypeColor[type]) ||
              'gray',
          },
          labelStyle: {
            transform: 'translateX(1px)',
            stroke:
              (linkTypeColor[type] != linkTypeColor.undefined &&
                linkTypeColor[type]) ||
              'gray',
            strokeWidth: '0.5px',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color:
              (linkTypeColor[type] != linkTypeColor.undefined &&
                linkTypeColor[type]) ||
              'gray',
          },
          style: {
            stroke:
              (linkTypeColor[type] != linkTypeColor.undefined &&
                linkTypeColor[type]) ||
              'gray',
          },
        };
        edges.push(_edge);
      }
    }
    if (flow.fromNodeId) {
      preHost.linker.nodeEntity[flow.linkerId].data.target = true;
      createEdge(
        preHost.from.nodeEntity[flow.fromNodeId].id,
        preHost.linker.nodeEntity[flow.linkerId].id,
        flow.fromLinkType,
      );
    }
    if (flow.toNodeId) {
      preHost.linker.nodeEntity[flow.linkerId].data.source = true;
      createEdge(
        preHost.linker.nodeEntity[flow.linkerId].id,
        preHost.to.nodeEntity[flow.toNodeId].id,
        flow.toLinkType,
      );
    }
  };
  for (let i = 0; i < len; i++) {
    const flow = flows[i];
    handleFrom(flow);
    handleLinker(flow);
    handleTo(flow);
    genEdge(flow);
  }

  calculationHeight();

  const handleCenterHostNode = () => {
    const _list_host = nodes.filter(item => item.id.startsWith('host-'));
    const len = _list_host.length;
    for (let i = 0; i < len; i++) {
      const host = _list_host[i];
      if (host.data.end - host.data.start > host.style.height) {
        const positionY =
          (host.data.end + host.data.start - host.style.height) / 2;
        host.position.y = positionY;
      }
    }
  };
  handleCenterHostNode();
  return { nodes, edges };
};
export function findPerpendicularPointFromMidpoint(x1, y1, x2, y2, distance) {
  //  find center(mid)
  const xm = (x1 + x2) / 2;
  const ym = (y1 + y2) / 2;

  // Calculate dX and dY values
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Calculate the length of the vector
  const length = Math.sqrt(dx * dx + dy * dy);

  // Calculate the unit vector perpendicular to the straight line

  const ux = -dy / length;
  const uy = dx / length;

  //Calculate the score coordinates (x3, y3)
  const x3 = xm + distance * ux;
  const y3 = ym + distance * uy;
  return { x3, y3 };
}

export function findBezierMidpoint(x1, y1, x2, y2, x3, y3) {
  const t = 0.5;
  const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * x3 + t * t * x2;
  const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * y3 + t * t * y2;
  return { x, y };
}

export function isIntersecting(
  lineStartX,
  lineStartY,
  lineEndX,
  lineEndY,
  rectStartX,
  rectStartY,
  rectWidth,
  rectHeight,
) {
  // The intersection test function of the two node

  function doIntersect(line1Start, line1End, line2Start, line2End) {
    // Determine the direction of the three points

    function orientation(pointA, pointB, pointC) {
      const value =
        (pointB.y - pointA.y) * (pointC.x - pointB.x) -
        (pointB.x - pointA.x) * (pointC.y - pointB.y);
      if (value === 0) return 0; // alternate

      return value > 0 ? 1 : 2; // Clockwise or clockwise
    }

    // Check to see if the point is on the segment
    function onSegment(pointA, pointB, pointC) {
      if (
        pointB.x <= Math.max(pointA.x, pointC.x) &&
        pointB.x >= Math.min(pointA.x, pointC.x) &&
        pointB.y <= Math.max(pointA.y, pointC.y) &&
        pointB.y >= Math.min(pointA.y, pointC.y)
      ) {
        return true;
      }
      return false;
    }

    const orientation1 = orientation(line1Start, line1End, line2Start);
    const orientation2 = orientation(line1Start, line1End, line2End);
    const orientation3 = orientation(line2Start, line2End, line1Start);
    const orientation4 = orientation(line2Start, line2End, line1End);

    if (orientation1 !== orientation2 && orientation3 !== orientation4)
      return true;

    // Check the cases in line
    if (orientation1 === 0 && onSegment(line1Start, line2Start, line1End))
      return true;
    if (orientation2 === 0 && onSegment(line1Start, line2End, line1End))
      return true;
    if (orientation3 === 0 && onSegment(line2Start, line1Start, line2End))
      return true;
    if (orientation4 === 0 && onSegment(line2Start, line1End, line2End))
      return true;

    return false;
  }

  const line1Start = { x: lineStartX, y: lineStartY };
  const line1End = { x: lineEndX, y: lineEndY };

  const rectPoints = [
    { x: rectStartX, y: rectStartY },
    { x: rectStartX + rectWidth, y: rectStartY },
    { x: rectStartX, y: rectStartY + rectHeight },
    { x: rectStartX + rectWidth, y: rectStartY + rectHeight },
  ];

  /*
  0 => upper edge
  1 => left side edge
  2 => lower edge
  3 => Side right edge
  */
  for (let i = 0; i < 4; i++) {
    const line2Start = rectPoints[i];
    const line2End = rectPoints[(i + 1) % 4];
    if (doIntersect(line1Start, line1End, line2Start, line2End)) {
      return true;
    }
  }

  return false;
}
