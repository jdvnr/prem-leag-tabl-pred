import type { IconName } from '../assets/icons'
import { icons } from '../assets/icons'

type IconProps = {
  name: IconName
}

export default function Icon({ name }: IconProps) {
  return (
    <img src={icons[name]} alt={name} />
  )
}