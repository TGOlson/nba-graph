import React, { useEffect, useState } from 'react';

import Graph from 'graphology';
import { bidirectional } from 'graphology-shortest-path';
import dijkstra from 'graphology-shortest-path/dijkstra';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Tooltip from '@mui/joy/Tooltip';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LinkIcon from '@mui/icons-material/Link';

import { Option, SearchOptionPlaceholder } from './NodeSearchSimple/SearchOption';
import NodeSearchSimple from './NodeSearchSimple';
import { NBAGraphNode } from '../../shared/types';

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
  const [showCopyTooltip, setShowCopyTooltip] = useState<boolean>(false);

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

  // TODO: maybe toggle?
  // const pathWeighted = source && target
  //   ? dijkstra.bidirectional(graph, source, target, (_, attr) => (attr as NBAGraphNode['attributes']).size).map(toNode)
  //   : null;

  const onSourceChange = (source: string | null) => {
    navigateToPath(source, target);
    setSource(source);
  };

  const onTargetChange = (target: string | null) => {
    navigateToPath(source, target);
    setTarget(target);
  };

  const copyPath = () => {
    if (!source || !target) return;

    const url = `${window.location.origin}/paths/${source}.${target}`;

    void navigator.clipboard.writeText(url).then(() => {
      setShowCopyTooltip(true);

      setTimeout(() => {
        setShowCopyTooltip(false);
      }, 1500);
    });
  };

  return (
    <Box sx={{m: 'auto', mt: {xs: 1.5, sm: 2}, gap: {xs: 1.5, sm: 2}, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 300}}>
      <Box sx={{width: '100%'}}>
        <Typography level='title-lg' fontSize={36}>NBA Paths</Typography>
        <Typography level='body-sm'>Connect any players in basketball history.</Typography>
      </Box>
      <Divider sx={{ml: -2, mr: -2}} />
      <Box sx={{width: '100%', gap: 2, display: 'flex', flexDirection: 'column'}}>
        <FormControl>
          <FormLabel>Source</FormLabel>
          <NodeSearchSimple initialNode={source} nodes={searchNodes} onChange={onSourceChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Target</FormLabel>
          <NodeSearchSimple initialNode={target} nodes={searchNodes} onChange={onTargetChange} />
        </FormControl>
      </Box>
      <Divider sx={{ml: -2, mr: -2, mt: 1}} />
      <Box sx={{width: '100%'}}>
        {source && target ? 
          <Box sx={{display: 'flex', justifyContent: 'flex-end', mt:{xs: -1, sm: -1.5}}}>
            <Tooltip open={showCopyTooltip} title='Copied!' placement='left' size='sm'>
              <IconButton size='sm' color='neutral' sx={{"--IconButton-size": "22px"}} onClick={copyPath}>
                <LinkIcon sx={{mr: 0.5}}/>
                <Typography level='body-xs'>Copy link</Typography>
              </IconButton>
            </Tooltip>
          </Box>
        : null}
        {path?.map((node, index) =>  {
          const option: Option = {
            key: node.key,
            searchString: '',
            attrs: node.attributes,
          };

          const isLastItem = index === path.length - 1;
          const showSubLabel = node.attributes.nbaType === 'team';

          return (
            <Box key={node.key}>
              <Box 
                sx={{
                  display: 'flex', 
                  pl: 2,
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
                <SearchOptionPlaceholder option={option} showSubLabel={showSubLabel} />
                <RouterLink className='path-graph-link' to={`/graph/${node.key}`} style={{marginRight: '8px'}}>
                  <IconButton size='sm' color='primary'>
                    <OpenInNewIcon />
                  </IconButton>
                </RouterLink>
              </Box>
              {isLastItem ? null : <Divider orientation='vertical' sx={{ml: '39px', height: 12}}/>}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
  
};

export default PathDisplay;
