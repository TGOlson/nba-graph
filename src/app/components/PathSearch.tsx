import React, { useEffect, useState } from 'react';

import Graph from 'graphology';
import { bidirectional } from 'graphology-shortest-path';
// import dijkstra from 'graphology-shortest-path/dijkstra';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Tooltip from '@mui/joy/Tooltip';
import Avatar from '@mui/joy/Avatar';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareIcon from '@mui/icons-material/Share';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

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
    <Box sx={{m: 'auto', height: '100vh', pt: 1.5, gap: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 332}}>
      <Box sx={{width: '100%', position: 'relative', pl: 2, pr: 2}}>
          <Typography level='title-lg' fontSize={36}>NBA Paths</Typography>
        <Typography level='body-sm'>Connect any players in basketball history.</Typography>
      </Box>
      <Divider />
      <Box sx={{width: '100%', gap: 1, pl: 2, pr: 2, display: 'flex', flexDirection: 'column'}}>
        <NodeSearchSimple initialNode={source} autocompleteProps={{placeholder: 'Player A'}} nodes={searchNodes} onChange={onSourceChange} />
        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
          <ArrowDownwardIcon fontSize='small' />
        </Box>
        <NodeSearchSimple initialNode={target} autocompleteProps={{placeholder: 'Player B'}} nodes={searchNodes} onChange={onTargetChange} />
      </Box>
      <Divider />
      <Box sx={{width: '100%', overflowY: 'scroll', mb: 2, pl: 2, display: 'flex', flexDirection: 'column', mt: -0.5}}>
        {path 
          ? <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Typography level='body-sm' sx={{textAlign: 'right'}}>Path of {(path.length - 1) / 2 + 1} steps</Typography> 
            <Tooltip open={showCopyTooltip} title='Link copied!' placement='left' size='sm'>
              <IconButton disabled={!source || !target} color='primary' onClick={copyPath}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
          : null
        }
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
                  // pl: 2,
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
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                  {index % 2 === 1
                    ? <Box sx={{width: '24px'}}/>
                    : <Avatar size="sm" color="primary" sx={{"--Avatar-size": "24px"}}>
                      {index % 2 === 0 ? <Typography level="body-sm" fontWeight={700} >{index / 2 + 1}</Typography> : null}
                    </Avatar>
                  }
                  <SearchOptionPlaceholder option={option} showSubLabel={showSubLabel} />
                </Box>
                <RouterLink className='path-graph-link' to={`/graph/${node.key}`} style={{marginRight: '8px'}}>
                  <IconButton size='sm' color='primary'>
                    <OpenInNewIcon />
                  </IconButton>
                </RouterLink>
              </Box>
              {isLastItem ? null : <Divider orientation='vertical' sx={{ml: '58px', height: 12}}/>}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
  
};

export default PathDisplay;
