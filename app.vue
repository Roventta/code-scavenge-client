<template>
  <h2>Cub Arena</h2>
  <div>
    <canvas ref="cvsEle"
    />
  </div>
</template>

<script setup lang="ts">
import { ActorComponent, CubeWarriorComponent, Engine, EventMultiplexer, GameBoardComp, Renderer } from './entities/GameEngine';

const cvsEle: Ref<HTMLCanvasElement|undefined> = ref();
const cvsContext: Ref<CanvasRenderingContext2D|undefined> = ref();
var engine:Engine;
var renderer;
var game_board;
var multi:EventMultiplexer;
var actor:CubeWarriorComponent;
onMounted(()=>{
  cvsContext.value = cvsEle.value?.getContext('2d')||undefined;
  renderer = new Renderer(10,10,cvsEle.value,cvsContext.value); 
  engine = new Engine(renderer)
  game_board = GameBoardComp.Instance(engine,renderer)
  multi = new EventMultiplexer();
  ["a","s","d","w"].forEach((c)=>{
    multi.newChannel(c)
  })
  actor = new CubeWarriorComponent(engine,renderer, multi)
  window.addEventListener("keypress", e=>{
    multi.activateChannel(e.key)
  })
})


</script>
