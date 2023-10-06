import React, { useEffect, useState } from 'react';

import Box from '@mui/joy/Box';

import { NBAGraphNode } from '../../shared/types';
import { Divider, FormControl, FormLabel, IconButton, Typography } from '@mui/joy';

import Graph from 'graphology';
// import NodeSearch from '../components/NodeSearch';
import { bidirectional } from 'graphology-shortest-path';
import dijkstra from 'graphology-shortest-path/dijkstra';
import { Option, SearchOptionPlaceholder } from './NodeSearchSimple/SearchOption';
import NodeSearchSimple from './NodeSearchSimple';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type PathDisplayProps = {
  graph: Graph;
  searchNodes: NBAGraphNode[];
};

const sourceTargetFromPath = (graph: Graph, path: string | undefined): [string | null, string | null] => {
  const [sourceRaw, targetRaw] = path?.split('.') ?? [null, null];
  const source = sourceRaw && graph.hasNode(sourceRaw) ? sourceRaw : null;
  const target = targetRaw && graph.hasNode(targetRaw) ? targetRaw : null;

  return [source, target];
};

const sourceFromPath = (graph: Graph, path: string | undefined): string | null => {
  const [source, _] = sourceTargetFromPath(graph, path);
  return source;
};

const targetFromPath = (graph: Graph, path: string | undefined): string | null => {
  const [_, target] = sourceTargetFromPath(graph, path);
  return target;
};

const PathDisplay = ({graph, searchNodes}: PathDisplayProps) => {
  const navigate = useNavigate();
  const { path: pathParam } = useParams();

  const [source, setSource] = useState<string | null>(sourceFromPath(graph, pathParam));
  const [target, setTarget] = useState<string | null>(targetFromPath(graph, pathParam));

  useEffect(() => {
    const [source, target] = sourceTargetFromPath(graph, pathParam);

    if (pathParam && (!source || !target)) {
      navigate(`/paths`);
    }
  }, [pathParam]);

  const navigateToPath = (source: string | null, target: string | null) => {
    if (source && target) {
      navigate(`/paths/${source}.${target}`);
    } else {
      navigate(`/paths`);
    }
  };

  const toNode = (key: string): NBAGraphNode => {
    const attrs = graph.getNodeAttributes(key) as NBAGraphNode['attributes'];
    return {key, attributes: attrs};
  };

  const path = source && target
    ? bidirectional(graph, source, target)?.map(toNode)
    : null;

  const pathWeighted = source && target
    ? dijkstra.bidirectional(graph, source, target, (_, attr) => (attr as NBAGraphNode['attributes']).size).map(toNode)
    : null;

  const onSourceChange = (source: string | null) => {
    navigateToPath(source, target);
    setSource(source);
  };

  const onTargetChange = (target: string | null) => {
    navigateToPath(source, target);
    setTarget(target);
  };

  return (
    <Box sx={{m: 'auto', mt: 2, gap: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 300}}>
      <Box>
        <Typography level='title-lg' fontSize={36}>NBA Paths</Typography>
        <Typography level='body-sm'>Find a path between any two players in basketball history!</Typography>
      </Box>
      <Divider sx={{ml: -2, mr: -2}} />
      <Box sx={{width: '100%'}}>
        <FormControl>
          <FormLabel>Source</FormLabel>
          <NodeSearchSimple initialNode={source} nodes={searchNodes} onChange={onSourceChange} />
        </FormControl>
        <Box sx={{mt: 1, mb: -1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <ArrowDownwardIcon fontSize='small' />
        </Box>
        <FormControl>
          <FormLabel>Target</FormLabel>
          <NodeSearchSimple initialNode={target} nodes={searchNodes} onChange={onTargetChange} />
        </FormControl>
      </Box>
      <Divider sx={{ml: -2, mr: -2, mt: 1}} />
      <Box sx={{width: '100%'}}>

      {path?.map((node) =>  {
        const option: Option = {
          key: node.key,
          searchString: '',
          attrs: node.attributes,
        };

        const showSubLabel = node.attributes.nbaType !== 'player';
        return (
          <Box 
            key={node.key} 
            sx={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              '&:hover': {
                backgroundColor: 'var(--joy-palette-neutral-plainHoverBg)',
              },
              '& .path-graph-link': {
                visibility: 'hidden',
              },
              '&:hover .path-graph-link': {
                visibility: 'visible',
              },
            }}
          >
            <SearchOptionPlaceholder  option={option} showSubLabel={showSubLabel} />
            <Link className='path-graph-link' to={`/graph/${node.key}`} style={{marginRight: '8px'}}>
              <IconButton size='sm' color='primary'>
                <OpenInNewIcon />
              </IconButton>
            </Link>
          </Box>
        );
      })}
      </Box>
      <Box sx={{width: '100%'}}>
        {pathWeighted ? <Typography>Weighted path</Typography> : null}
        {pathWeighted?.map((node) =>  {
          const option: Option = {
            key: node.key,
            searchString: '',
            attrs: node.attributes,
          };
          
          return <SearchOptionPlaceholder key={node.key} option={option} />;
        })}
      </Box>
    </Box>
  );
  
};

export default PathDisplay;
