
export const SapIcon = ({name,size=16,color="",style={}}:{name:string,size?:number,color?:string,style?:any}) => (
  <ui5-icon name={name} style={{width:size,height:size,display:"inline-block",verticalAlign:"middle",...(color?{color}:{}),...style}}/>
);

