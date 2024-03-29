import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Mining.css';
import { Grid, Cell } from 'styled-css-grid';
import { getTimeToHarvestInSeconds, useBackgroundTask, useLocalStorage, useSetPlayerTask } from '../../../utils';
import { AllSkills, AllTasks } from '../../../types';
import { getItemById, Item } from '../../../itemDb';
import ProgressBar from '../../shared/ProgressBar';
import NumberRenderer from '../../shared/NumberRenderer';
import DurationTimer from '../../shared/DurationTimer';

function MiningHome() {
  // const [playerMiningLevel
  const baseMiningTth = 2500;
  const miningNodeItemIds: number[] = [1,2,3,4];
  const miningNodeItems: Item[] = useMemo(() => miningNodeItemIds.map((id: number) => getItemById(id) as Item), [miningNodeItemIds]);
  const [playerItems, updatePlayerItems, inventoryLastUpdatedAt] = useLocalStorage('idle-king-inventory', [] as Item[]);
  const [currentMiningTargetId, setCurrentMiningTargetId] = useState(0);
  const [currentPlayerTask, setPlayerTask, taskStartedAt] = useSetPlayerTask();
  const [itemsToDisplay, updateItemsToDisplay] = useState(playerItems);

  // TODO: See about moving this logic out to a shared library, so we can continue updating even when not on the skill screen
  useBackgroundTask((inventory) => updateItemsToDisplay(inventory));
  useEffect(() => {
    // did mount:
    const targetedItem = miningNodeItems.find(i => i.gatheringTask === currentPlayerTask)
    if (targetedItem && currentMiningTargetId !== targetedItem.id) {
      setCurrentMiningTargetId(targetedItem.id)
    }
    return () => {
      // will unmount:
    }
  }, []);

  const miningNodeClicked = useCallback((item: Item) => {
    if (currentMiningTargetId !== 0) {
      setPlayerTask()
      setCurrentMiningTargetId(0);
    } else {
      setPlayerTask(item.gatheringTask, AllSkills.MINING)
      setCurrentMiningTargetId(item.id);
    }
  }, [currentMiningTargetId, setPlayerTask]);
  const getPlayerOreCount = useCallback((ore: Item) => itemsToDisplay.find(i => i.id === ore.id)?.count || 0, [itemsToDisplay]);
  const addOreToPlayerInventory = useCallback((item: Item) => {
    if (itemsToDisplay.length > 0){
      // add the item if the player doesn't have it
      let playerDoesntOwn = true;
      const newItems = itemsToDisplay.map((pitem: Item) => {
        if (item.id === pitem.id) {
          playerDoesntOwn = false;
          return {...pitem, count: pitem.count + item.count};
        } else return pitem;
      });
      if (playerDoesntOwn) {
        newItems.push(item);
      }
      updatePlayerItems(newItems);
      updateItemsToDisplay(newItems);
    } else {
      updatePlayerItems([item]);
      updateItemsToDisplay([item]);
    }
  }, [itemsToDisplay, updatePlayerItems]);


  return (
    <div className="Mining-explorer-container" id="Mining-explorer-container">
      {currentMiningTargetId === 0 ? 'Idling' : 'Mining'} {currentMiningTargetId === 0 ? '' : miningNodeItems.find(i => i.id === currentMiningTargetId)?.displayName} {currentPlayerTask === AllTasks.IDLE ? undefined : (
      <>
        for <DurationTimer taskStartedAt={taskStartedAt} />
      </>
      )}
    <Grid
      className="Mining-explorer-grid"
      columns={4}
      gap={"0.5em"}
      justifyContent="center"
      alignContent="center"
    >
      {miningNodeItems.map((item: Item, idx: number) => (
        <Cell className="Mining-explorer-cell" id={'mining-explorer-cell-' + item.id + '-' + idx} key={'mining-explorer-cell-' + item.id + '-' + idx} onClick={() => miningNodeClicked(item)}>
          <img alt={`${item.displayName} icon in bank inventory`} src={`./ItemDB/${item.img}`}/>
          <p>{item.displayName}{item.count > 1 ? <NumberRenderer prefix={'x'}value={item.count}/> : ''}</p>
          <p>Owned: <NumberRenderer prefix={'x'} value={getPlayerOreCount(item)}/></p>
          {currentMiningTargetId === item.id
            ? <ProgressBar durationInMillis={item.tthModifier + baseMiningTth} callback={() => addOreToPlayerInventory(item)} repeating/>
            : <p>{getTimeToHarvestInSeconds(baseMiningTth, [item.tthModifier])}s</p> }
        </Cell>
      ))}
    </Grid>

    </div>
  )
}

export default MiningHome;
