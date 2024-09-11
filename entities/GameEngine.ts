const GRIDSIZE = 50;
const ACTORSIZE = 15;
const BLACK="#000000"

export class Engine{
    private components:Component[] = []
    private renderer:Renderer
    constructor(r:Renderer){
        this.renderer=r
    }
    public pushComp(c:Component){this.components.push(c)}
    public insertComponent(c:Component){
        this.components.push(c)
    }
    public tickAll(){
        this.renderer.clearCanvas()
        this.components.forEach((c)=>{c.tick()})
    }
    
}

export class Renderer{
    protected dom:HTMLCanvasElement|undefined;
    protected domContext:CanvasRenderingContext2D|undefined
    private dimension:[number, number]=[0,0];
    constructor(x:number, y:number, d:HTMLCanvasElement|undefined, 
        c:CanvasRenderingContext2D|undefined){
            this.dimension[0]=x;
            this.dimension[1]=y
            this.dom = d;
            this.domContext = c;
            this.initCanvas()
    }
    public initCanvas(){
        if(this.dom){
            this.dom.width=this.dimension[0]*GRIDSIZE
            this.dom.height=this.dimension[1]*GRIDSIZE
        }
    }
    public clearCanvas(){
        if(this.domContext){
            this.domContext.clearRect(0,0,this.dimension[0]*GRIDSIZE,this.dimension[1]*GRIDSIZE)
        }
    }
    public drawRectFill(x:number, y:number, w:number, h:number, color?:string){
        if(this.domContext){
        if(color){this.domContext.fillStyle=color}
        this.domContext.fillRect(x,y,w,h)
        this.domContext.fillStyle=BLACK
        }
    }
    public drawRectFrame(x:number, y:number, w:number, h:number, color?:string){
        if(this.domContext){
        if(color){this.domContext.fillStyle=color}
        this.domContext.strokeRect(x,y,w,h)
        this.domContext.fillStyle=BLACK
        }
    }
    public get getDimension(){return this.dimension}
}

export class EventMultiplexer{
    private channels:Map<string, Eventlistener[]> = new Map<string, Eventlistener[]>;
    constructor(){}
    public newChannel(eventName:string){
        this.channels.set(eventName, [])
    }
    public subscribe(eventName:string,l:Eventlistener){
        let c = this.channels.get(eventName)
        if(c){c.push(l)}
    }
    public activateChannel(eventName:string){
        let c=this.channels.get(eventName)
        if(c){c.forEach((l=>{l.onEvent()}))}
    }
}

export class Eventlistener{
    private multiplexer:EventMultiplexer
    private eventName;
    private holder:ActorComponent;
    constructor(es:string, h:ActorComponent, e:EventMultiplexer){
        this.eventName = es;
        this.holder = h;
        this.multiplexer = e
        this.multiplexer.subscribe(this.eventName, this)
    } 
    onEvent(){this.holder.eventExecute(this.eventName)}
}

export abstract class Component{
    abstract init():void;
    abstract tick():void;
    protected engine:Engine
    protected renderer:Renderer
    constructor(e:Engine, r:Renderer){this.engine=e; this.renderer=r;
        this.engine.pushComp(this)
    }
}

export class SolidSqareComp extends Component{
    protected color:string = BLACK;
    protected dimension:[number, number] = [ACTORSIZE,ACTORSIZE]
    protected location:[number, number] = [0,0]
    constructor(e:Engine,r:Renderer, color:string){
        super(e,r);
        this.color = color
        this.init()
    }
    init(){
        this.tick()
    }
    setLocation(l:[number,number]){this.location = l}
    tick(){
        this.renderer.drawRectFill(this.location[0],this.location[1],this.dimension[0],this.dimension[1], this.color)
    }
}

export class ActorComponent extends Component{
    protected multiplexer:EventMultiplexer;
    protected location:[number, number] = [0,0]
    protected sprite: SolidSqareComp|undefined
    //actor component can log itsself towards a multiplexer
    constructor(e:Engine, r:Renderer, m:EventMultiplexer){
        super(e,r)
        this.sprite = new SolidSqareComp(e,r,"#E4080A")
        this.multiplexer = m;
    } 
    public eventExecute(eventName:string){
    }
    protected logEvents(eventName:string){
        new Eventlistener(eventName,this,this.multiplexer)
    }
    init(){ 
    }
    tick(){
        this.sprite?.setLocation(this.location)
    }
}

export class CubeWarriorComponent extends ActorComponent{
    override eventExecute(eventName: string): void {
        switch(eventName){
            case("a"):this.move([-5,0]); break;
            case("s"):this.move([0,5]); break;
            case("d"):this.move([5,0]); break;
            case("w"):this.move([0,-5]); break;
        }
    }
    constructor(e:Engine, r:Renderer, m:EventMultiplexer){
        super(e,r,m)
        this.logEvents("a")
        this.logEvents("s")
        this.logEvents("d")
        this.logEvents("w")
    } 
    public move(vector:[number,number]){
        this.location[0]+=vector[0]
        this.location[1]+=vector[1]
        this.engine.tickAll()
    }
}

// strict singleton
export class GameBoardComp extends Component{
    private static instance: GameBoardComp;
    private dimension:[number,number]=[0,0];
    private constructor(e:Engine,r:Renderer){
        super(e,r)
        this.dimension=this.renderer.getDimension;
        this.init()
    };
    public static Instance(e:Engine, r:Renderer){
        return this.instance || (this.instance=new GameBoardComp(e,r))
    }
    init(){
        this.tick()
    }
    override tick(): void {
        this.drawGrids()
    }
    private drawGrids(){
        for(let i=0; i<this.dimension[0]; i++){
            for(let j=0; j<this.dimension[1]; j++){
                this.renderer.drawRectFrame(j*GRIDSIZE, i*GRIDSIZE, GRIDSIZE, GRIDSIZE)
            }
        }
    }
}